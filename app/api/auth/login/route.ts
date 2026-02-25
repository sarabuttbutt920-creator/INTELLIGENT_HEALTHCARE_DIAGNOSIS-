import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_medi_intel_2026';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Basic structural validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required fields." },
                { status: 400 }
            );
        }

        // Search for user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials." },
                { status: 401 }
            );
        }

        // Deactivation guard check
        if (!user.is_active) {
            return NextResponse.json(
                { success: false, message: "This account has been deactivated. Please contact support." },
                { status: 403 }
            );
        }

        // Compare Bcrypt string matching
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials." },
                { status: 401 }
            );
        }

        // Asynchronously update login metadata flag
        await prisma.user.update({
            where: { user_id: user.user_id },
            data: { last_login_at: new Date() }
        });

        // Generate encrypted Token Payload
        const tokenPayload = {
            user_id: user.user_id.toString(),
            role: user.role,
            email: user.email,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        const response = NextResponse.json({
            success: true,
            message: "Authentication successful. Access granted.",
            data: tokenPayload
        }, { status: 200 });

        // Save token to an HttpOnly Secure Server State cookie
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // Expiry map to 7 calendar days
        });

        return response;

    } catch (error) {
        console.error("Login verification error:", error);
        return NextResponse.json(
            { success: false, message: "A server side error was encountered verifying your state." },
            { status: 500 }
        );
    }
}
