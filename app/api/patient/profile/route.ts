import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// Helper for BigInt serialization
const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

export async function GET() {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const patientProfile = await prisma.patient.findUnique({
            where: { patient_id: user.patient.patient_id },
            include: {
                user: {
                    select: {
                        full_name: true,
                        email: true,
                        phone: true,
                        created_at: true
                    }
                },
                encounters: {
                    orderBy: { encounter_date: 'desc' },
                    take: 5,
                    include: {
                        labResult: true,
                        predictions: true
                    }
                },
                appointments: {
                    where: { scheduled_start: { gte: new Date() }, status: { in: ['REQUESTED', 'CONFIRMED'] } },
                    orderBy: { scheduled_start: 'asc' },
                    take: 1,
                    include: {
                        doctor: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        if (!patientProfile) {
            return NextResponse.json({ success: false, message: 'Patient profile not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile: serialize(patientProfile) });

    } catch (error) {
        console.error('Error fetching patient profile:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { phone, address, emergencyContactName, emergencyContactPhone, bloodGroup, gender, dateOfBirth } = body;

        // Ensure we handle BigInts appropriately if we had them or valid references
        const updatedPatient = await prisma.patient.update({
            where: { patient_id: user.patient.patient_id },
            data: {
                address: address || undefined,
                emergency_contact_name: emergencyContactName || undefined,
                emergency_contact_phone: emergencyContactPhone || undefined,
                blood_group: bloodGroup || undefined,
                gender: gender || undefined,
                date_of_birth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                user: {
                    update: {
                        phone: phone || undefined
                    }
                }
            },
            include: {
                user: {
                    select: { full_name: true, email: true, phone: true }
                }
            }
        });

        return NextResponse.json({ success: true, profile: serialize(updatedPatient) });

    } catch (error) {
        console.error('Error updating patient profile:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
