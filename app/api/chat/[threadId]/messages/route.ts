import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// Helper to handle BigInt serialization
const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function GET(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    try {
        const user = await getUserSession();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const threadId = BigInt(resolvedParams.threadId);

        // Security check: is the user part of this thread?
        const thread = await prisma.chatThread.findUnique({
            where: { thread_id: threadId }
        });

        if (!thread) {
            return NextResponse.json({ success: false, message: 'Thread not found' }, { status: 404 });
        }

        if (user.role === 'PATIENT' && user.patient && thread.patient_id !== user.patient.patient_id) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (user.role === 'DOCTOR' && user.doctor && thread.doctor_id !== user.doctor.doctor_id) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const messages = await prisma.chatMessage.findMany({
            where: { thread_id: threadId },
            orderBy: { sent_at: 'asc' } // Older to newer
        });

        return NextResponse.json({ success: true, messages: serialize(messages) });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    try {
        const user = await getUserSession();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { text } = body;
        const resolvedParams = await params;
        const threadId = BigInt(resolvedParams.threadId);

        if (!text || text.trim() === '') {
            return NextResponse.json({ success: false, message: 'Message text is required' }, { status: 400 });
        }

        // Security check
        const thread = await prisma.chatThread.findUnique({
            where: { thread_id: threadId }
        });

        if (!thread) {
            return NextResponse.json({ success: false, message: 'Thread not found' }, { status: 404 });
        }

        if (user.role === 'PATIENT' && user.patient && thread.patient_id !== user.patient.patient_id) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (user.role === 'DOCTOR' && user.doctor && thread.doctor_id !== user.doctor.doctor_id) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const newMessage = await prisma.chatMessage.create({
            data: {
                thread_id: threadId,
                sender_user_id: user.user_id,
                message_text: text,
            }
        });

        return NextResponse.json({ success: true, message: serialize(newMessage) });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
