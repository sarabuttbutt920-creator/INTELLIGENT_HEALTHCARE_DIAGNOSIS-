import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ encounterId: string }> }
) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { encounterId } = await params;
        const body = await request.json();
        const { action, doctorNotes } = body;

        const rawId = encounterId.replace('ENC-', '');
        const encounterIdBigInt = BigInt(rawId);

        if (action === 'SIGN_OFF') {
            const signedNote = `[SIGNED OFF by Dr. ${user.full_name} on ${new Date().toLocaleDateString()}]\n\n${doctorNotes || 'Encounter reviewed and signed off by attending physician.'}`;

            const updated = await prisma.patientEncounter.update({
                where: { encounter_id: encounterIdBigInt },
                data: { notes: signedNote }
            });

            return NextResponse.json(serialize({ success: true, message: 'Encounter signed off successfully', encounter: updated }));
        }

        return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    } catch (error: any) {
        console.error('Encounter update error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ encounterId: string }> }
) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'DOCTOR') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { encounterId } = await params;
        const rawId = encounterId.replace('ENC-', '');

        const encounter = await prisma.patientEncounter.findUnique({
            where: { encounter_id: BigInt(rawId) },
            include: {
                patient: {
                    include: {
                        user: true,
                        appointments: {
                            orderBy: { scheduled_start: 'desc' },
                            take: 5
                        }
                    }
                },
                labResult: true,
                predictions: { orderBy: { created_at: 'desc' } },
                clinicalNotes: { orderBy: { created_at: 'desc' } },
                report: true
            }
        });

        if (!encounter) {
            return NextResponse.json({ success: false, message: 'Encounter not found' }, { status: 404 });
        }

        return NextResponse.json(serialize({ success: true, encounter }));
    } catch (error: any) {
        console.error('Get encounter error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
