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
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const [logs, total, uniqueIPs] = await Promise.all([
            prisma.visitorLog.findMany({
                skip,
                take: limit,
                orderBy: { visited_at: "desc" },
                include: {
                    user: { select: { full_name: true, role: true, email: true } }
                }
            }),
            prisma.visitorLog.count(),
            prisma.visitorLog.findMany({
                select: { ip_address: true },
                distinct: ["ip_address"]
            })
        ]);

        // Stats for last 24 hours
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recent24hCount = await prisma.visitorLog.count({
            where: { visited_at: { gte: last24h } }
        });

        const mapped = logs.map(l => ({
            id: l.visitor_id.toString(),
            userId: l.user_id ? l.user_id.toString() : null,
            userName: l.user?.full_name || null,
            role: l.user?.role || null,
            email: l.user?.email || null,
            ipAddress: l.ip_address || "Unknown",
            userAgent: l.user_agent || "Unknown",
            page: l.page || "/",
            visitedAt: l.visited_at
        }));

        return NextResponse.json(serialize({
            success: true,
            logs: mapped,
            total,
            page,
            limit,
            stats: {
                total24h: recent24hCount,
                uniqueIPs: uniqueIPs.length,
                totalVisits: total
            }
        }));
    } catch (err) {
        console.error("[ADMIN_LOGS_GET]", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
