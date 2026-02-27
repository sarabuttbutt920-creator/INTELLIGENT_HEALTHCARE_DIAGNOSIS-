import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email format").transform(str => str.toLowerCase().trim()),
    phone: z.string().optional(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    role: z.enum(['PATIENT', 'DOCTOR']),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Block Admin signup completely at entry point
        if (body.role === 'ADMIN') {
            return NextResponse.json(
                { success: false, message: "Administrative accounts cannot be created via public registration." },
                { status: 403 }
            );
        }

        // Validate payload shape and security rules via Zod
        const validationResult = signupSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: validationResult.error.issues },
                { status: 400 }
            );
        }

        const { fullName, email, phone, password, role } = validationResult.data;

        // Check for duplicates
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "A user with this email already exists" },
                { status: 409 }
            );
        }

        // Secure password using Bcrypt
        const password_hash = await bcrypt.hash(password, 10);

        // Transactionally commit User + Profile relation mapping
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    full_name: fullName,
                    email,
                    phone,
                    password_hash,
                    role,
                    is_active: true,
                },
            });

            if (role === 'PATIENT') {
                await tx.patient.create({
                    data: {
                        user_id: newUser.user_id,
                    }
                });
            } else if (role === 'DOCTOR') {
                await tx.doctor.create({
                    data: {
                        user_id: newUser.user_id,
                        specialization: 'General Practice', // Initial fallback value
                    }
                });
            }

            return newUser;
        });

        return NextResponse.json({
            success: true,
            message: "Account provisioned successfully.",
            data: { id: result.user_id.toString(), email: result.email, role: result.role }
        }, { status: 201 });

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error connecting to the database." },
            { status: 500 }
        );
    }
}
