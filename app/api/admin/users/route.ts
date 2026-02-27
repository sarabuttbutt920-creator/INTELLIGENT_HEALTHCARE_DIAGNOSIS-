import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password needs at least 6 characters"),
    role: z.enum(["ADMIN", "DOCTOR", "PATIENT"]),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
        where.OR = [
            { full_name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    if (role !== "ALL") {
        where.role = role;
    }
    if (status !== "ALL") {
        where.is_active = status === "active";
    }

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                select: {
                    user_id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                    role: true,
                    is_active: true,
                    created_at: true,
                    last_login_at: true,
                }
            }),
            prisma.user.count({ where })
        ]);

        return NextResponse.json({ users, totalCount: total });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fullName, email, phone, password, role } = createUserSchema.parse(body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                full_name: fullName,
                email,
                phone,
                password_hash,
                role,
                is_active: true,
            },
            select: { user_id: true, full_name: true, email: true, role: true, is_active: true, created_at: true }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 400 });
    }
}
