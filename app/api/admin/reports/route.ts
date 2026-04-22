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
        const skip = (page - 1) * limit;

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    encounter: {
                        include: {
                            patient: {
                                include: {
                                    user: { select: { full_name: true } }
                                }
                            },
                            enteredBy: { select: { full_name: true } },
                            predictions: {
                                take: 1,
                                orderBy: { created_at: "desc" },
                                select: { predicted_label: true, risk_score: true }
                            }
                        }
                    }
                }
            }),
            prisma.report.count()
        ]);

        const mapped = reports.map(r => {
            const pred = r.encounter.predictions[0];
            const riskScore = pred ? Number(pred.risk_score || 0) : 0;
            let severity: string;
            if (!pred) severity = "NORMAL";
            else if (pred.predicted_label === "CKD" && riskScore >= 0.8) severity = "CRITICAL";
            else if (pred.predicted_label === "CKD" && riskScore >= 0.6) severity = "SEVERE";
            else if (pred.predicted_label === "CKD") severity = "MILD";
            else severity = "NORMAL";

            return {
                id: r.report_id.toString(),
                encounterId: `ENC-${r.encounter_id}`,
                patientName: r.encounter.patient.user.full_name,
                patientId: `PAT-${r.encounter.patient.patient_id}`,
                doctorName: `Dr. ${r.encounter.enteredBy.full_name}`,
                summary: r.summary,
                recommendations: r.recommendations || "",
                severity,
                status: r.pdf_url ? "FINALIZED" : "PENDING_REVIEW",
                hasPdf: !!r.pdf_url,
                pdfUrl: r.pdf_url,
                createdAt: r.created_at
            };
        });

        return NextResponse.json(serialize({ success: true, reports: mapped, total, page, limit }));
    } catch (err) {
        console.error("[ADMIN_REPORTS_GET]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getUserSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { reportId, summary, recommendations } = await req.json();
        if (!reportId) return NextResponse.json({ success: false, message: "reportId required" }, { status: 400 });

        const updated = await prisma.report.update({
            where: { report_id: BigInt(reportId) },
            data: { summary, recommendations }
        });

        return NextResponse.json(serialize({ success: true, report: updated }));
    } catch (err) {
        console.error("[ADMIN_REPORTS_PUT]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getUserSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get("id");
        if (!reportId) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });

        await prisma.report.delete({ where: { report_id: BigInt(reportId) } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[ADMIN_REPORTS_DELETE]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
