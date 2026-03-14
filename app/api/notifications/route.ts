import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

export async function GET() {
    try {
        const user = await getUserSession();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let appointmentsCount = 0;
        let unreadMessagesCount = 0;
        let activities: any[] = [];

        if (user.role === 'DOCTOR' && user.doctor) {
            // Unread Messages (mocked as message from another user in last 7 days)
            const chats = await prisma.chatMessage.findMany({
                where: {
                    thread: { doctor_id: user.doctor.doctor_id },
                    sender_user_id: { not: user.user_id },
                    sent_at: { gte: sevenDaysAgo }
                },
                include: { sender: true },
                orderBy: { sent_at: 'desc' },
                take: 5
            });
            unreadMessagesCount = chats.length;

            const apts = await prisma.appointment.findMany({
                where: {
                    doctor_id: user.doctor.doctor_id,
                    status: 'REQUESTED'
                },
                include: { patient: { include: { user: true } } },
                orderBy: { created_at: 'desc' },
                take: 5
            });
            appointmentsCount = apts.length;

            // Combine into activities
            apts.forEach(a => activities.push({
                id: `apt-${a.appointment_id}`,
                type: 'APPOINTMENT',
                title: 'New Appointment Request',
                message: `${a.patient.user.full_name} requested an appointment.`,
                time: a.created_at,
                read: false,
            }));
            chats.forEach(c => activities.push({
                id: `chat-${c.message_id}`,
                type: 'CHAT',
                title: 'New Message',
                message: `${c.sender.full_name} sent you a message.`,
                time: c.sent_at,
                read: false,
            }));

        } else if (user.role === 'PATIENT' && user.patient) {
            const inSevenDays = new Date();
            inSevenDays.setDate(inSevenDays.getDate() + 7);

            const apts = await prisma.appointment.findMany({
                where: {
                    patient_id: user.patient.patient_id,
                    status: 'CONFIRMED',
                    scheduled_start: { gte: new Date(), lte: inSevenDays }
                },
                include: { doctor: { include: { user: true } } },
                orderBy: { scheduled_start: 'asc' },
                take: 5
            });
            appointmentsCount = apts.length;

            const chats = await prisma.chatMessage.findMany({
                where: {
                    thread: { patient_id: user.patient.patient_id },
                    sender_user_id: { not: user.user_id },
                    sent_at: { gte: sevenDaysAgo }
                },
                include: { sender: true },
                orderBy: { sent_at: 'desc' },
                take: 5
            });
            unreadMessagesCount = chats.length;

            apts.forEach(a => activities.push({
                id: `apt-${a.appointment_id}`,
                type: 'APPOINTMENT',
                title: 'Upcoming Confirmed Appointment',
                message: `You have an appointment with Dr. ${a.doctor.user.full_name}.`,
                time: a.created_at, // Use creation time for notification
                read: false,
            }));
            chats.forEach(c => activities.push({
                id: `chat-${c.message_id}`,
                type: 'CHAT',
                title: 'New Message',
                message: `${c.sender.full_name} sent you a message.`,
                time: c.sent_at,
                read: false,
            }));
        }

        // Sort activities by time
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        // Helper to serialize BigInt
        const serialize = (obj: any): any => {
            return JSON.parse(JSON.stringify(obj, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));
        };

        return NextResponse.json(serialize({
            success: true,
            appointments: appointmentsCount,
            messages: unreadMessagesCount,
            activities: activities,
        }));

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
