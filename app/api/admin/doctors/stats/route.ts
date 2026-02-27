import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const [totalDoctors, verifiedDoctors, pendingDoctors] = await Promise.all([
            prisma.doctor.count(),
            prisma.doctor.count({ where: { verification_status: "APPROVED" } }),
            prisma.doctor.count({ where: { verification_status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] } } }),
        ]);

        return NextResponse.json({
            totalDoctors,
            verifiedDoctors,
            pendingDoctors,
            inactiveAccounts: totalDoctors - verifiedDoctors // As an example alternative stat
        }, { status: 200 });

    } catch (error: any) {
        console.error("Stats fetching error", error);
        return NextResponse.json({ error: "Failed to load doctor statistics" }, { status: 500 });
    }
}
