import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

export async function GET() {
    try {
        const session = await getUserSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const patientsData = await prisma.patient.findMany({
            include: {
                user: true,
                _count: {
                    select: {
                        encounters: true,
                    }
                },
                encounters: {
                    include: {
                        _count: {
                            select: {
                                predictions: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const mappedPatients = patientsData.map(p => {
            const predictionsCount = p.encounters.reduce((acc, enc) => acc + enc._count.predictions, 0);

            return {
                id: `PAT-${p.patient_id.toString()}`,
                fullName: p.user.full_name,
                email: p.user.email,
                phone: p.user.phone || 'N/A',
                dateOfBirth: p.date_of_birth ? p.date_of_birth.toISOString() : new Date().toISOString(),
                gender: p.gender || 'OTHER',
                bloodGroup: p.blood_group || 'Unknown',
                emerContactName: p.emergency_contact_name || 'None',
                emerContactPhone: p.emergency_contact_phone || 'N/A',
                totalEncounters: p._count.encounters,
                predictionsCount: predictionsCount,
                status: p.user.is_active ? 'active' : 'inactive',
                joinedAt: p.created_at.toISOString(),
                avatar: p.user.full_name ? p.user.full_name.charAt(0).toUpperCase() : 'U'
            };
        });

        return NextResponse.json({ success: true, patients: mappedPatients });

    } catch (e) {
        console.error('[ADMIN_PATIENTS_API]', e);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
