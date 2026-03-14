import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function GET() {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const doctors = await prisma.doctor.findMany({
            where: {
                verification_status: 'APPROVED',
                user: { is_active: true }
            },
            include: {
                user: {
                    select: {
                        full_name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        // Fallback: If no approved doctors, just return all active ones for the demo
        if (doctors.length === 0) {
            const allActive = await prisma.doctor.findMany({
                where: { user: { is_active: true } },
                include: { user: { select: { full_name: true, email: true, phone: true } } }
            });
            return NextResponse.json({ success: true, doctors: serialize(allActive) });
        }

        return NextResponse.json({ success: true, doctors: serialize(doctors) });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
