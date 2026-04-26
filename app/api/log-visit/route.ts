import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { page } = body;
        
        const session = await getUserSession();
        const userId = session?.user_id ? BigInt(session.user_id) : null;
        
        const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown";
        const userAgent = req.headers.get("user-agent") || "Unknown";

        await prisma.visitorLog.create({
            data: {
                user_id: userId,
                ip_address: ipAddress.split(",")[0].trim(),
                user_agent: userAgent.substring(0, 255),
                page: page ? String(page).substring(0, 200) : "/",
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[LOG_VISIT_ERROR]", e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
