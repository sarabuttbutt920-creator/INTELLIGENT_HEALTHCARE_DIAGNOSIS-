import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createAdminSchema = z.object({
    fullName: z.string().min(2, "Full name required"),
    email: z.string().email("Invalid email").transform((val) => val.toLowerCase().trim()),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters for admin"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fullName, email, phone, password } = createAdminSchema.parse(body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const adminUser = await prisma.user.create({
            data: {
                full_name: fullName,
                email,
                phone,
                password_hash,
                role: "ADMIN",
                is_active: true,
            },
            select: {
                user_id: true,
                full_name: true,
                email: true,
                role: true,
                created_at: true,
                is_active: true,
            }
        });

        return NextResponse.json(adminUser, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 400 });
    }
}
