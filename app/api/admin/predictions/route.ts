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
        const label = searchParams.get("label");
        const skip = (page - 1) * limit;

        const where: any = {};
        if (label && label !== "ALL") where.predicted_label = label;

        const [predictions, total] = await Promise.all([
            prisma.prediction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    encounter: {
                        include: {
                            patient: {
                                include: {
                                    user: { select: { full_name: true, email: true } }
                                }
                            },
                            enteredBy: { select: { full_name: true } }
                        }
                    }
                }
            }),
            prisma.prediction.count({ where })
        ]);

        const mapped = predictions.map(p => ({
            id: p.prediction_id.toString(),
            encounterId: p.encounter_id.toString(),
            patientName: p.encounter.patient.user.full_name,
            patientId: `PAT-${p.encounter.patient.patient_id}`,
            doctorName: `Dr. ${p.encounter.enteredBy.full_name}`,
            modelName: p.model_name,
            modelVersion: p.model_version,
            predictedLabel: p.predicted_label,
            riskScore: Number(p.risk_score || 0),
            explanation: p.explanation_json
                ? (typeof p.explanation_json === 'object' ? JSON.stringify(p.explanation_json).substring(0, 120) : String(p.explanation_json))
                : "No explanation provided.",
            createdAt: p.created_at
        }));

        return NextResponse.json(serialize({ success: true, predictions: mapped, total, page, limit }));
    } catch (err) {
        console.error("[ADMIN_PREDICTIONS_GET]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
