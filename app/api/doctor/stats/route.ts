import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function GET() {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const doctorId = user.doctor.doctor_id;

        // Get all appointments for unique patient count
        const allAppointments = await prisma.appointment.findMany({
            where: { doctor_id: doctorId },
            include: {
                patient: { include: { user: { select: { full_name: true, phone: true } } } }
            },
            orderBy: { scheduled_start: 'asc' }
        });

        const uniquePatientIds = [...new Set(allAppointments.map(a => a.patient_id.toString()))];
        const totalPatients = uniquePatientIds.length;

        // Today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysAppointments = allAppointments.filter(a => {
            const d = new Date(a.scheduled_start);
            return d >= today && d < tomorrow;
        });

        // Reports reviewed this week (encounters with notes)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const patientBigIntIds = uniquePatientIds.map(id => BigInt(id));

        const reportsReviewed = patientBigIntIds.length > 0
            ? await prisma.patientEncounter.count({
                where: {
                    patient_id: { in: patientBigIntIds },
                    notes: { not: null },
                    encounter_date: { gte: weekAgo }
                }
            })
            : 0;

        // Average rating from DoctorReview
        const reviews = await prisma.doctorReview.findMany({
            where: { doctor_id: doctorId },
            select: { rating: true }
        });
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '4.8';

        // Weekly patient visit data (last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const count = allAppointments.filter(a => {
                const d = new Date(a.scheduled_start);
                return d >= dayStart && d < dayEnd && (a.status === 'CONFIRMED' || a.status === 'COMPLETED');
            }).length;

            weeklyData.push({ day: days[dayStart.getDay()], patients: count, goal: 8 });
        }

        // Map today's appointments for frontend
        const mappedAppointments = todaysAppointments.map(apt => ({
            id: `APT-${apt.appointment_id}`,
            patient: apt.patient.user.full_name,
            patientPhone: apt.patient.user.phone || '',
            time: apt.scheduled_start,
            type: apt.reason || 'Consultation',
            status: apt.status,
            risk: 'Low'
        }));

        return NextResponse.json(serialize({
            success: true,
            stats: {
                totalPatients: totalPatients || 0,
                todaysCount: todaysAppointments.length,
                reportsReviewed,
                avgRating,
                reviewCount: reviews.length
            },
            todaysAppointments: mappedAppointments,
            weeklyData
        }));

    } catch (error: any) {
        console.error('Stats API error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
