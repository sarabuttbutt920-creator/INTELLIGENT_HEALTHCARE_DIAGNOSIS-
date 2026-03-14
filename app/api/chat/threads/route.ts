import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function GET() {
    try {
        const user = await getUserSession();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        let threads: any[] = [];
        let contacts: any[] = [];

        if (user.role === 'PATIENT' && user.patient) {
            // Find existing threads
            threads = await prisma.chatThread.findMany({
                where: {
                    patient_id: user.patient.patient_id,
                    thread_type: 'DOCTOR'
                },
                include: {
                    doctor: {
                        include: { user: true }
                    },
                    messages: {
                        orderBy: { sent_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            // Find all doctors as contacts
            contacts = await prisma.doctor.findMany({
                where: { verification_status: 'APPROVED' },
                include: { user: true }
            });

        } else if (user.role === 'DOCTOR' && user.doctor) {
            threads = await prisma.chatThread.findMany({
                where: {
                    doctor_id: user.doctor.doctor_id,
                    thread_type: 'DOCTOR'
                },
                include: {
                    patient: {
                        include: { user: true }
                    },
                    messages: {
                        orderBy: { sent_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            // Find patients this doctor has interacted with (appointments or encounters)
            const appointments = await prisma.appointment.findMany({
                where: { doctor_id: user.doctor.doctor_id },
                select: { patient_id: true }
            });
            const patientIds = Array.from(new Set(appointments.map(a => a.patient_id)));

            contacts = await prisma.patient.findMany({
                where: { patient_id: { in: patientIds } },
                include: { user: true }
            });
        }

        return NextResponse.json({ success: true, threads: serialize(threads), contacts: serialize(contacts), currentUserId: user.user_id.toString() });

    } catch (error) {
        console.error('Error fetching threads:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
