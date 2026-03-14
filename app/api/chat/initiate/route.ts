import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// Helper to handle BigInt serialization
const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function POST(req: Request) {
    try {
        const user = await getUserSession();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { targetId } = body; // target doctor_id or patient_id depending on the user's role
        const id = BigInt(targetId);

        let patient_id;
        let doctor_id;

        if (user.role === 'PATIENT' && user.patient) {
            patient_id = user.patient.patient_id;
            doctor_id = id;
        } else if (user.role === 'DOCTOR' && user.doctor) {
            doctor_id = user.doctor.doctor_id;
            patient_id = id;
        } else {
            return NextResponse.json({ success: false, message: 'Invalid role for chatting' }, { status: 403 });
        }

        // See if a thread already exists
        let thread = await prisma.chatThread.findFirst({
            where: {
                patient_id: patient_id,
                doctor_id: doctor_id,
                thread_type: 'DOCTOR'
            }
        });

        if (!thread) {
            // Create a new thread
            thread = await prisma.chatThread.create({
                data: {
                    patient_id: patient_id,
                    doctor_id: doctor_id,
                    thread_type: 'DOCTOR'
                }
            });
        }

        return NextResponse.json({ success: true, thread: serialize(thread) });

    } catch (error) {
        console.error('Error initiating chat:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
