import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const verifyStatus = searchParams.get("verifyStatus") || "ALL"; // ALL, VERIFIED, PENDING, SUSPENDED

        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (search) {
            whereClause.user = {
                OR: [
                    { full_name: { contains: search } },
                    { email: { contains: search } }
                ]
            };
        }

        if (verifyStatus === "VERIFIED") whereClause.verification_status = "APPROVED";
        if (verifyStatus === "PENDING") whereClause.verification_status = { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] };
        if (verifyStatus === "SUSPENDED") whereClause.verification_status = "SUSPENDED";

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    user: {
                        select: {
                            full_name: true,
                            email: true,
                            phone: true,
                            is_active: true,
                        }
                    }
                }
            }),
            prisma.doctor.count({ where: whereClause })
        ]);

        return NextResponse.json({
            doctors: doctors.map(d => ({
                doctor_id: d.doctor_id.toString(),
                user_id: d.user_id.toString(),
                full_name: d.user.full_name,
                email: d.user.email,
                phone: d.user.phone,
                specialization: d.specialization,
                license_no: d.license_no,
                hospital_name: d.hospital_name,
                verification_status: d.verification_status,
                is_active: d.user.is_active,
                created_at: d.created_at,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 });

    } catch (error: any) {
        console.error("Doctor fetch error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch doctors" }, { status: 500 });
    }
}
