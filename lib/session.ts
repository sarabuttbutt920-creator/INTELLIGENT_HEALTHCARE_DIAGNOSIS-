import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_medi_intel_2026';

export async function getUserSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (!payload || !payload.user_id) return null;

        const user = await prisma.user.findUnique({
            where: { user_id: BigInt(payload.user_id) },
            include: { patient: true, doctor: true }
        });

        return user;
    } catch (e) {
        return null;
    }
}
