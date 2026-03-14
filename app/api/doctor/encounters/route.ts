import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// Helper to handle BigInt serialization
const serialize = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

export async function GET(request: Request) {
    try {
        const user = await getUserSession();

        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized. Doctor access required.' }, { status: 401 });
        }

        // 1. Fetch appointments where this doctor is involved, to get patient IDs.
        const doctorAppointments = await prisma.appointment.findMany({
            where: { doctor_id: user.doctor.doctor_id },
            select: { patient_id: true }
        });

        let patientIds = doctorAppointments.map(a => a.patient_id);
        
        // Remove duplicates
        patientIds = [...new Set(patientIds)];

        // 2. Fetch encounters for these patients
        let patientEncounters = await prisma.patientEncounter.findMany({
            where: {
                patient_id: { in: patientIds }
            },
            include: {
                patient: { include: { user: true } },
                labResult: true,
                predictions: { orderBy: { created_at: 'desc' }, take: 1 }
            },
            orderBy: { encounter_date: 'desc' },
            take: 20
        });

        if (patientEncounters.length === 0) {
            // For demo purposes, if the doctor has 0 patient encounters, fetch global encounters
            patientEncounters = await prisma.patientEncounter.findMany({
                include: {
                    patient: { include: { user: true } },
                    labResult: true,
                    predictions: { orderBy: { created_at: 'desc' }, take: 1 }
                },
                orderBy: { encounter_date: 'desc' },
                take: 10
            });
        }

        // 3. Map to DTO for the frontend
        const mappedEncounters = patientEncounters.map(enc => {
            const latestPred = enc.predictions && enc.predictions.length > 0 ? enc.predictions[0] : null;

            let aiResult = "INCONCLUSIVE";
            let aiConfidence = 50.0;
            let modelUsed = "KidneyNet Baseline Context";

            if (latestPred) {
                if (latestPred.predicted_label === 'CKD') aiResult = "CKD_DETECTED";
                else if (latestPred.predicted_label === 'NOT_CKD') aiResult = "NOT_CKD";
                else aiResult = "INCONCLUSIVE";

                modelUsed = latestPred.model_name || "KidneyNet-RF v2.1";
                if (latestPred.risk_score) {
                    aiConfidence = Math.round((Number(latestPred.risk_score.toString()) * 100));
                }
            }

            // Determine status based on if doctor notes exist (mocked or real)
            let status = "DRAFT";
            if (latestPred) {
                // If there's a prediction but no notes, it's pending review
                status = enc.notes ? "SIGNED_OFF" : "PENDING_REVIEW";
            } else if (!enc.labResult) {
                status = "DRAFT";
            }

            return {
                id: `ENC-${enc.encounter_id}`, // String ID mapped exactly to page demands
                patientName: enc.patient?.user?.full_name || "Unknown Patient",
                patientId: `PAT-${enc.patient_id}`,
                date: enc.encounter_date,
                modelUsed: modelUsed,
                aiConfidence: aiConfidence,
                aiResult: aiResult,
                status: status,
                keyBiomarkers: {
                    bloodPressure: enc.labResult ? `${enc.labResult.blood_pressure || 120}/80` : "N/A",
                    hemoglobin: enc.labResult?.hemoglobin ? enc.labResult.hemoglobin : "14.5",
                    serumCreatinine: enc.labResult?.serum_creatinine ? enc.labResult.serum_creatinine : "1.1",
                    bloodUrea: enc.labResult?.blood_urea ? enc.labResult.blood_urea : "40"
                },
                doctorNotes: enc.notes || ""
            };
        });

        return NextResponse.json(serialize({ success: true, encounters: mappedEncounters }));

    } catch (error: any) {
        console.error('Error fetching encounters:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
