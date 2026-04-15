import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { prediction_id, is_correct } = body;

        if (!prediction_id || typeof is_correct !== 'boolean') {
            return NextResponse.json(
                { success: false, message: 'Invalid payload. Required: prediction_id, is_correct' },
                { status: 400 }
            );
        }

        // Verify prediction belongs to the patient
        const prediction = await prisma.prediction.findUnique({
            where: { prediction_id: BigInt(prediction_id) },
            include: { encounter: true }
        });

        if (!prediction || prediction.encounter.patient_id !== user.patient.patient_id) {
            return NextResponse.json(
                { success: false, message: 'Prediction not found or access denied.' },
                { status: 404 }
            );
        }

        // Update feedback
        await prisma.prediction.update({
            where: { prediction_id: BigInt(prediction_id) },
            data: { feedback: is_correct }
        });

        return NextResponse.json({
            success: true,
            message: 'Feedback recorded successfully for model retraining.'
        });

    } catch (error) {
        console.error('[Feedback Endpoint Error]', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
