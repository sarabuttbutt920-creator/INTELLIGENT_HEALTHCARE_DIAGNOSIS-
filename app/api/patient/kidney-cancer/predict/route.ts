import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';
import fs from 'fs';
import path from 'path';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        // 1. Save file locally
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);
        const fileUrl = `/uploads/${fileName}`;

        // 2. Forward to Flask API
        const flaskFormData = new FormData();
        // create a Blob to append to FormData for node-fetch compatibility if needed, but native fetch in Next.js handles File/Blob
        const blob = new Blob([buffer], { type: file.type });
        flaskFormData.append('file', blob, file.name);

        let flaskResponse: Response;
        try {
            flaskResponse = await fetch(`${FLASK_API_URL}/api/kidney-cancer/predict`, {
                method: 'POST',
                body: flaskFormData,
                signal: AbortSignal.timeout(30_000),
            });
        } catch (networkErr) {
            console.error('[Cancer Prediction] Flask service unreachable:', networkErr);
            return NextResponse.json(
                { success: false, message: 'The AI imaging service is currently unavailable.' },
                { status: 503 }
            );
        }

        if (!flaskResponse.ok) {
            return NextResponse.json(
                { success: false, message: 'Prediction service returned an error.' },
                { status: 502 }
            );
        }

        const flaskData = await flaskResponse.json();

        if (!flaskData.success) {
            return NextResponse.json(
                { success: false, message: 'Model inference failed.' },
                { status: 500 }
            );
        }

        const isTumor = flaskData.result === 'Tumor';
        const confidence = flaskData.confidence;

        // 3. Save to database: Encounter -> MedicalFile + Prediction
        const encounter = await prisma.patientEncounter.create({
            data: {
                patient_id: user.patient.patient_id,
                entered_by_user_id: user.user_id,
                notes: 'Kidney Tumor MRI/X-Ray AI Analysis',
                medicalFiles: {
                    create: {
                        uploaded_by_user_id: user.user_id,
                        file_type: 'SCAN_IMAGE',
                        file_url: fileUrl,
                        original_name: file.name,
                        mime_type: file.type
                    }
                },
                predictions: {
                    create: {
                        model_name: 'KidneyTumor-Vision',
                        model_version: '1.0',
                        predicted_label: isTumor ? 'CKD' : 'NOT_CKD', // We can use CKD/NOT_CKD or UNKNOWN. Schema only allows: CKD, NOT_CKD, UNKNOWN
                        risk_score: isTumor ? confidence : 1 - confidence,
                        explanation_json: {
                            diagnosis: flaskData.result,
                            confidence: confidence,
                            type: 'Imaging'
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            result: flaskData.result,
            confidence: confidence,
            fileUrl: fileUrl
        });

    } catch (e) {
        console.error('[Cancer Prediction] Error:', e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
