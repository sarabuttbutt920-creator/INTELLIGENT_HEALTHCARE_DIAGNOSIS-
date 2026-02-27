import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const [totalUsers, activeDoctors, totalPatients, inactiveAccounts] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "DOCTOR", is_active: true } }),
            prisma.user.count({ where: { role: "PATIENT" } }),
            prisma.user.count({ where: { is_active: false } }),
        ]);

        return NextResponse.json({
            totalUsers,
            activeDoctors,
            totalPatients,
            inactiveAccounts
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
