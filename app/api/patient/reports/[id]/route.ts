import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const resolvedParams = await params;
        // id looks like REP-xyz
        if (!resolvedParams.id || !resolvedParams.id.startsWith('REP-')) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        const reportId = BigInt(resolvedParams.id.replace('REP-', ''));
        const body = await req.json();

        // Security Check
        const report = await prisma.report.findUnique({
            where: { report_id: reportId },
            include: { encounter: true }
        });

        if (!report || report.encounter.patient_id !== user.patient.patient_id) {
            return NextResponse.json({ success: false }, { status: 403 });
        }

        await prisma.report.update({
            where: { report_id: reportId },
            data: {
                summary: body.summary,
                recommendations: body.recommendations
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const resolvedParams = await params;
        if (!resolvedParams.id || !resolvedParams.id.startsWith('REP-')) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        const reportId = BigInt(resolvedParams.id.replace('REP-', ''));

        const report = await prisma.report.findUnique({
            where: { report_id: reportId },
            include: { encounter: true }
        });

        if (!report || report.encounter.patient_id !== user.patient.patient_id) {
            return NextResponse.json({ success: false }, { status: 403 });
        }

        await prisma.report.delete({ where: { report_id: reportId } });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
