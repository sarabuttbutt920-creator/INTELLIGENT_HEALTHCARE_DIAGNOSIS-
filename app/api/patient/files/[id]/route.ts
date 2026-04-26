import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const fileId = parseInt(params.id);
        if (isNaN(fileId)) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        // Verify ownership
        const medicalFile = await prisma.medicalFile.findUnique({
            where: { file_id: BigInt(fileId) },
            include: { encounter: true }
        });

        if (!medicalFile || medicalFile.encounter.patient_id !== user.patient.patient_id) {
            return NextResponse.json({ success: false, message: 'Not found or forbidden' }, { status: 404 });
        }

        await prisma.medicalFile.delete({
            where: { file_id: BigInt(fileId) }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
