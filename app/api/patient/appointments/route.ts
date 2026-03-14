import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

// ── GET: Fetch patient appointments ──────────────────────────────────────
export async function GET() {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const appointments = await prisma.appointment.findMany({
            where: { patient_id: user.patient.patient_id },
            orderBy: { scheduled_start: 'asc' },
            include: {
                doctor: {
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
        console.error('Error fetching patient appointments:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// ── POST: Create patient appointment ──────────────────────────────────────
export async function POST(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { doctor_id, scheduled_start, reason } = body;

        if (!doctor_id || !scheduled_start) {
            return NextResponse.json({ success: false, message: 'Doctor ID and scheduled time are required' }, { status: 400 });
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                patient_id: user.patient.patient_id,
                doctor_id: BigInt(doctor_id),
                scheduled_start: new Date(scheduled_start),
                reason: reason || null,
                status: 'REQUESTED'
            },
            include: {
                doctor: {
                    include: { user: { select: { full_name: true } } }
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Appointment booked successfully', appointment: serialize(newAppointment) });
    } catch (error) {
        console.error('Error creating patient appointment:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// ── PUT: Update patient appointment ──────────────────────────────────────
export async function PUT(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { appointment_id, scheduled_start, reason } = body;

        if (!appointment_id) {
            return NextResponse.json({ success: false, message: 'Appointment ID is required' }, { status: 400 });
        }

        const existing = await prisma.appointment.findUnique({
            where: { appointment_id: BigInt(appointment_id) }
        });

        if (!existing || existing.patient_id !== user.patient.patient_id) {
            return NextResponse.json({ success: false, message: 'Appointment not found or unauthorized' }, { status: 404 });
        }

        const updated = await prisma.appointment.update({
            where: { appointment_id: BigInt(appointment_id) },
            data: {
                scheduled_start: scheduled_start ? new Date(scheduled_start) : undefined,
                reason: reason !== undefined ? reason : undefined,
                status: 'REQUESTED' // Resets to requested on change
            },
            include: {
                doctor: {
                    include: { user: { select: { full_name: true } } }
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Appointment updated successfully', appointment: serialize(updated) });
    } catch (error) {
        console.error('Error updating patient appointment:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// ── DELETE: Cancel/Delete patient appointment ────────────────────────────
export async function DELETE(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'Appointment ID is required in query params' }, { status: 400 });
        }

        const existing = await prisma.appointment.findUnique({
            where: { appointment_id: BigInt(id) }
        });

        if (!existing || existing.patient_id !== user.patient.patient_id) {
            return NextResponse.json({ success: false, message: 'Appointment not found or unauthorized' }, { status: 404 });
        }

        await prisma.appointment.delete({
            where: { appointment_id: BigInt(id) }
        });

        return NextResponse.json({ success: true, message: 'Appointment cancelled/deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient appointment:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
