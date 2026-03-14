import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

// ── GET: Fetch doctor appointments ──────────────────────────────────────
export async function GET() {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const appointments = await prisma.appointment.findMany({
            where: { doctor_id: user.doctor.doctor_id },
            orderBy: { scheduled_start: 'asc' },
            include: {
                patient: {
                    include: {
                        user: {
                            select: { full_name: true, email: true, phone: true }
                        }
                    }
                }
            }
        });

        return NextResponse.json({ success: true, appointments: serialize(appointments) });
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// ── PUT: Accept/Reject/Update doctor appointments ────────────────────────────────
export async function PUT(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { appointment_id, status } = body;

        if (!appointment_id || !status) {
            return NextResponse.json({ success: false, message: 'Appointment ID and status are required' }, { status: 400 });
        }

        const existing = await prisma.appointment.findUnique({
            where: { appointment_id: BigInt(appointment_id) }
        });

        if (!existing || existing.doctor_id !== user.doctor.doctor_id) {
            return NextResponse.json({ success: false, message: 'Appointment not found or unauthorized' }, { status: 404 });
        }

        const updated = await prisma.appointment.update({
            where: { appointment_id: BigInt(appointment_id) },
            data: { status: status }, // CONFIRMED, REJECTED/CANCELLED, etc.
            include: { patient: { include: { user: { select: { full_name: true } } } } }
        });

        return NextResponse.json({ success: true, message: `Appointment ${status.toLowerCase()} successfully`, appointment: serialize(updated) });
    } catch (error) {
        console.error('Error updating doctor appointment:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
