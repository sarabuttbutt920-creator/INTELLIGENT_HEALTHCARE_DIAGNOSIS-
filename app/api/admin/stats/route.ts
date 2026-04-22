import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

const serialize = (obj: any) =>
    JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export async function GET() {
    try {
        const session = await getUserSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        const [
            totalPatients,
            totalDoctors,
            totalPredictions,
            ckdCount,
            todayAppointments,
            pendingAppointments,
            totalReports,
            recentPredictions
        ] = await Promise.all([
            prisma.patient.count(),
            prisma.doctor.count(),
            prisma.prediction.count(),
            prisma.prediction.count({ where: { predicted_label: "CKD" } }),
            prisma.appointment.count({
                where: {
                    scheduled_start: { gte: startOfToday },
                    status: { in: ["CONFIRMED", "REQUESTED"] }
                }
            }),
            prisma.appointment.count({ where: { status: "REQUESTED" } }),
            prisma.report.count(),
            prisma.prediction.findMany({
                take: 6,
                orderBy: { created_at: "desc" },
                include: {
                    encounter: {
                        include: {
                            patient: { include: { user: { select: { full_name: true } } } }
                        }
                    }
                }
            })
        ]);

        // Weekly chart: predictions per day for last 7 days
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(now.getDate() - i);
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const count = await prisma.prediction.count({
                where: { created_at: { gte: dayStart, lt: dayEnd } }
            });
            const ckd = await prisma.prediction.count({
                where: { created_at: { gte: dayStart, lt: dayEnd }, predicted_label: "CKD" }
            });

            weeklyData.push({
                day: day.toLocaleDateString("en-US", { weekday: "short" }),
                predictions: count,
                ckdFlags: ckd
            });
        }

        const avgRiskScore = await prisma.prediction.aggregate({
            _avg: { risk_score: true }
        });

        return NextResponse.json(serialize({
            success: true,
            stats: {
                totalPatients,
                totalDoctors,
                totalPredictions,
                ckdCount,
                todayAppointments,
                pendingAppointments,
                totalReports,
                avgRiskScore: Number(avgRiskScore._avg.risk_score || 0)
            },
            weeklyData,
            recentPredictions: recentPredictions.map(p => ({
                id: p.prediction_id.toString(),
                patient: p.encounter.patient.user.full_name,
                avatar: p.encounter.patient.user.full_name.charAt(0).toUpperCase(),
                predictedLabel: p.predicted_label,
                riskScore: Number(p.risk_score || 0),
                modelName: p.model_name,
                createdAt: p.created_at
            }))
        }));
    } catch (err) {
        console.error("[ADMIN_STATS_ERROR]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
