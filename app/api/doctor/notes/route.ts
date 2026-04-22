import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function GET(request: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        let whereClause: any = { doctor_id: user.doctor.doctor_id };

        if (patientId) {
            const encounters = await prisma.patientEncounter.findMany({
                where: { patient_id: BigInt(patientId) },
                select: { encounter_id: true }
            });
            const encounterIds = encounters.map(e => e.encounter_id);
            if (encounterIds.length > 0) {
                whereClause.encounter_id = { in: encounterIds };
            } else {
                return NextResponse.json(serialize({ success: true, notes: [] }));
            }
        }

        const notes = await prisma.clinicalNote.findMany({
            where: whereClause,
            include: {
                encounter: {
                    include: {
                        patient: { include: { user: { select: { full_name: true } } } }
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        return NextResponse.json(serialize({ success: true, notes }));
    } catch (error: any) {
        console.error('GET notes error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { patientId, noteTitle, noteContent, template, tags } = body;

        if (!patientId || !noteContent) {
            return NextResponse.json({ success: false, message: 'Patient ID and note content are required' }, { status: 400 });
        }

        // Find the latest encounter for this patient or create one
        let encounter = await prisma.patientEncounter.findFirst({
            where: { patient_id: BigInt(patientId) },
            orderBy: { encounter_date: 'desc' }
        });

        if (!encounter) {
            encounter = await prisma.patientEncounter.create({
                data: {
                    patient_id: BigInt(patientId),
                    entered_by_user_id: user.user_id,
                    notes: noteTitle || 'Clinical Note'
                }
            });
        }

        const tagsStr = tags && tags.length > 0 ? `\nTags: ${tags.join(', ')}` : '';
        const fullNoteText = `[${template || 'GENERAL'}] ${noteTitle || 'Clinical Note'}\n\n${noteContent}${tagsStr}`;

        const note = await prisma.clinicalNote.create({
            data: {
                encounter_id: encounter.encounter_id,
                doctor_id: user.doctor.doctor_id,
                note_text: fullNoteText
            }
        });

        // Update encounter notes field with signed-off indicator
        await prisma.patientEncounter.update({
            where: { encounter_id: encounter.encounter_id },
            data: { notes: fullNoteText }
        });

        return NextResponse.json(serialize({ success: true, note, message: 'Clinical note saved successfully' }));
    } catch (error: any) {
        console.error('POST notes error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
