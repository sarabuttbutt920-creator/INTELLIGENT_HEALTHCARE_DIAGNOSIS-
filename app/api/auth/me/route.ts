import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_medi_intel_2026';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized - Token Missing" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const user = await prisma.user.findUnique({
            where: { user_id: BigInt(decoded.user_id) },
            select: {
                user_id: true,
                full_name: true,
                email: true,
                role: true,
                is_active: true
            }
        });

        if (!user || !user.is_active) {
            return NextResponse.json({ success: false, message: "User account suspended or missing." }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user.user_id.toString(),
                email: user.email,
                name: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Your session token was expired or corrupt." }, { status: 401 });
    }
}
