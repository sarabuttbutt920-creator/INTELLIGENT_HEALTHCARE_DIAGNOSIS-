import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

const serialize = (obj: any) =>
    JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status && status !== "ALL") where.status = status;

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { scheduled_start: "desc" },
                include: {
                    patient: { include: { user: { select: { full_name: true, email: true, phone: true } } } },
                    doctor: {
                        select: {
                            doctor_id: true,
                            specialization: true,
                            user: { select: { full_name: true } }
                        }
                    }
                }
            }),
            prisma.appointment.count({ where })
        ]);

        const mapped = appointments.map(a => {
            let type = "IN_PERSON";
            let cleanReason = a.reason || "General Visit";
            if (cleanReason.startsWith("TELEHEALTH:")) {
                type = "VIDEO_CALL";
                cleanReason = cleanReason.replace("TELEHEALTH:", "").trim();
            } else if (cleanReason.startsWith("CLINIC:")) {
                cleanReason = cleanReason.replace("CLINIC:", "").trim();
            }

            return {
                id: a.appointment_id.toString(),
                patientName: a.patient?.user?.full_name || "Unknown Patient",
                patientId: `PAT-${a.patient_id}`,
                patientPhone: a.patient?.user?.phone || "N/A",
                doctorName: `Dr. ${a.doctor?.user?.full_name || "Unknown"}`,
                specialization: a.doctor?.specialization || "General Practice",
                scheduledStart: a.scheduled_start,
                scheduledEnd: a.scheduled_end,
                durationMinutes: a.scheduled_end
                    ? Math.round((new Date(a.scheduled_end).getTime() - new Date(a.scheduled_start).getTime()) / 60000)
                    : 30,
                status: a.status,
                reason: cleanReason,
                type,
                createdAt: a.created_at
            };
        });

        return NextResponse.json(serialize({ success: true, appointments: mapped, total, page, limit }));
    } catch (err) {
        console.error("[ADMIN_APPOINTMENTS_GET]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getUserSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { appointmentId, status } = await req.json();
        if (!appointmentId || !status) {
            return NextResponse.json({ success: false, message: "appointmentId and status required" }, { status: 400 });
        }

        const updated = await prisma.appointment.update({
            where: { appointment_id: BigInt(appointmentId) },
            data: { status }
        });

        return NextResponse.json(serialize({ success: true, appointment: updated }));
    } catch (err) {
        console.error("[ADMIN_APPOINTMENTS_PUT]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
