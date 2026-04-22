import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// ── Flask microservice URL ─────────────────────────────────────────────────────
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

// ── Helper: safe decimal parse ─────────────────────────────────────────────────
const parseD = (v: string | number | undefined | null): number | null => {
    const parsed = parseFloat(String(v ?? ''));
    return isNaN(parsed) ? null : parsed;
};

// ── Feature mapping: frontend form → 8 model features ─────────────────────────
//
// The model was trained on exactly these 8 features:
//   sg, htn, hemo, dm, al, appet, rc, pc
//
// The frontend collects a richer clinical dataset. We map here so the Python
// service receives ready-to-use values (it also handles the mapping itself, but
// sending pre-mapped fields gives cleaner inference logs).
//
function buildModelPayload(body: Record<string, string>) {

    // ── Legacy 8 core features (v1 compatibility) ───────────────────────────────
    const parsedSg = parseD(body.specific_gravity) ?? 1.020;
    const sg = parsedSg.toFixed(3); // ARFF expects string with 3 decimals e.g '1.020'
    const hemo = parseD(body.hemoglobin) ?? 12.526;
    const htn  = body.hypertension === '1' ? 'yes' : 'no';
    const dm   = body.diabetes === '1' ? 'yes' : 'no';

    // Albumin scale 0-5 derived from urine albumin mg/L
    const urineAlbumin = parseD(body.urine_albumin) ?? -1;
    let al = 0;
    if      (urineAlbumin >= 400) al = 5;
    else if (urineAlbumin >= 300) al = 4;
    else if (urineAlbumin >= 200) al = 3;
    else if (urineAlbumin >= 100) al = 2;
    else if (urineAlbumin >=  30) al = 1;

    const appet = 'good'; // appetite — good by default (not in form)

    // RBC count estimated from hematocrit (RBC ≈ Hct / 9)
    const hematocrit = parseD(body.hematocrit);
    const rbcc = hematocrit && hematocrit > 0
        ? Math.round((hematocrit / 9.0) * 100) / 100
        : 4.714;

    // Pus cells: urine WBC ≥ 5 = abnormal
    const urineWbc = parseD(body.urine_wbc) ?? 0;
    const pc = urineWbc >= 5 ? 'abnormal' : 'normal';

    // ── Extended v2 features (24-feature model) ──────────────────────────────────
    const age  = parseD(body.age)          ?? 51.5;
    const bp   = parseD(body.systolic_bp)  ?? 76.5;  // use systolic as bp

    // Urine sugar scale (0-5): estimate from blood glucose
    const bgr   = parseD(body.random_blood_sugar) ?? 148.0;
    const su    = bgr >= 500 ? 5 : bgr >= 400 ? 4 : bgr >= 300 ? 3 : bgr >= 200 ? 2 : bgr >= 140 ? 1 : 0;

    // RBC abnormality from urine_rbc
    const urineRbc   = parseD(body.urine_rbc) ?? 0;
    const rbc        = urineRbc > 5 ? 'abnormal' : 'normal';

    // Pus cell clumps / bacteria: default absent
    const pcc   = 'notpresent';
    const ba    = 'notpresent';

    const bu    = parseD(body.blood_urea_nitrogen) ?? 57.4;
    const sc    = parseD(body.serum_creatinine)    ?? 3.1;
    const sod   = parseD(body.sodium)              ?? 137.5;
    const pot   = parseD(body.potassium)           ?? 4.6;
    const pcv   = parseD(body.hematocrit)          ?? 38.9;   // packed cell vol = hematocrit
    const wbcc  = parseD(body.wbc_count)           ?? 8406.0;
    const cad   = body.cardiovascular_disease === '1' ? 'yes' : 'no';
    const pe    = 'no';   // pedal edema — not in form, default absent
    const ane   = 'no';   // anemia — derive from hemoglobin instead of hard-code

    return {
        // 8 legacy features mapped appropriately
        sg, htn, hemo, dm, al, appet, rbcc, pc,
        // 16 extended v2 features mapped appropriately
        age, bp, su, rbc, pcc, ba, bgr, bu, sc, sod, pot, pcv, wbcc, cad, pe, ane,
    };
}

// ── POST /api/patient/prediction ──────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        // ── Auth check ─────────────────────────────────────────────────────────
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: Record<string, string> = await req.json();

        // ── Build the 8-feature payload ────────────────────────────────────────
        const modelPayload = buildModelPayload(body);

        // ── Call the Flask prediction microservice ─────────────────────────────
        let flaskResponse: Response;
        try {
            flaskResponse = await fetch(`${FLASK_API_URL}/api/ckd/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(modelPayload),
                // 10-second timeout via AbortController
                signal: AbortSignal.timeout(10_000),
            });
        } catch (networkErr) {
            console.error('[Prediction] Flask service unreachable:', networkErr);
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'The AI prediction service is currently unavailable. ' +
                        'Please make sure the Python Flask service is running on port 5000 and try again.',
                },
                { status: 503 }
            );
        }

        if (!flaskResponse.ok) {
            const errText = await flaskResponse.text();
            console.error('[Prediction] Flask returned error:', flaskResponse.status, errText);
            return NextResponse.json(
                { success: false, message: 'Prediction service returned an error. Please try again.' },
                { status: 502 }
            );
        }

        const flaskData = await flaskResponse.json();

        if (!flaskData.success) {
            console.error('[Prediction] Flask prediction failed:', flaskData.error);
            return NextResponse.json(
                { success: false, message: 'Model inference failed: ' + (flaskData.error ?? 'Unknown error') },
                { status: 500 }
            );
        }

        // ── Extract real prediction values ─────────────────────────────────────
        const isPositive: boolean = flaskData.prediction === 1;       // true = CKD
        const riskScore: number = Math.round(flaskData.risk_score * 100); // 0-100
        const confidence: number = flaskData.confidence;

        // ── Persist encounter + lab result + prediction to DB ──────────────────
        const encounter = await prisma.patientEncounter.create({
            data: {
                patient_id: user.patient.patient_id,
                entered_by_user_id: user.user_id,
                notes: 'AI Assessment via KidneyNet Prediction Form',
                labResult: {
                    create: {
                        age: parseInt(body.age) || null,
                        blood_pressure: parseInt(body.systolic_bp) || null,
                        blood_glucose_random: parseD(body.random_blood_sugar),
                        blood_urea: parseD(body.blood_urea_nitrogen),
                        serum_creatinine: parseD(body.serum_creatinine),
                        sodium: parseD(body.sodium),
                        potassium: parseD(body.potassium),
                        hemoglobin: parseD(body.hemoglobin),
                        packed_cell_volume: parseD(body.hematocrit),
                        white_blood_cell_count: parseD(body.wbc_count),
                        red_blood_cell_count: parseD(body.urine_rbc),
                        hypertension: body.hypertension === '1',
                        diabetes_mellitus: body.diabetes === '1',
                    },
                },
                predictions: {
                    create: [{
                        model_name: 'KidneyNet-v1',
                        model_version: '1.0-tuned',
                        predicted_label: isPositive ? 'CKD' : 'NOT_CKD',
                        risk_score: flaskData.risk_score,            // real value 0-1
                        explanation_json: {
                            features_used: flaskData.features_used,
                            confidence: confidence,
                            model_accuracy: '97.5%',
                        },
                    }],
                },
            },
            include: { predictions: true } // Include predictions to retrieve the generated prediction ID
        });

        const predictionId = encounter.predictions[0]?.prediction_id.toString();

        // ── Update patient gender if missing ───────────────────────────────────
        if (body.gender && !user.patient.gender) {
            const mappedGender = body.gender.toUpperCase();
            if (['MALE', 'FEMALE', 'OTHER'].includes(mappedGender)) {
                await prisma.patient.update({
                    where: { patient_id: user.patient.patient_id },
                    data: { gender: mappedGender as 'MALE' | 'FEMALE' | 'OTHER' },
                });
            }
        }

        // ── Return real result to frontend ─────────────────────────────────────
        return NextResponse.json({
            success: true,
            isPositive,                           // true = CKD detected
            riskScore,                            // 0-100 integer
            confidence: Math.round(confidence * 100), // 0-100 integer
            result: flaskData.result,         // "CKD" | "NOT_CKD"
            prediction_id: predictionId       // Inject id into frontend response for feedback collection
        });

    } catch (error) {
        console.error('[Prediction] Unexpected error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
