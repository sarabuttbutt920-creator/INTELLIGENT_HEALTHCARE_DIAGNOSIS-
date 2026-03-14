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

        const encounters = await prisma.patientEncounter.findMany({
            where: { patient_id: user.patient.patient_id },
            include: {
                predictions: true,
                labResult: true,
                clinicalNotes: { include: { doctor: { include: { user: true } } } },
                report: true,
                enteredBy: true,
            },
            orderBy: { encounter_date: 'desc' }
        });

        const reports: any[] = [];

        for (const enc of encounters) {
            // Lab results
            if (enc.labResult) {
                reports.push({
                    id: `LAB-${enc.labResult.lab_id}`,
                    encId: enc.encounter_id.toString(),
                    title: "Comprehensive Metabolic Panel (CMP)",
                    category: "LAB_RESULT",
                    date: enc.encounter_date.toISOString(),
                    doctorName: enc.enteredBy.full_name,
                    isRead: true,
                    fileSize: "1.2 MB",
                    summary: `Lab analysis generated via panel. BP: ${enc.labResult.blood_pressure || 'N/A'}, Glucose: ${enc.labResult.blood_glucose_random?.toString() || 'N/A'}.`,
                    highlight: { label: "eGFR", value: "Checked", isAbnormal: false },
                    deleteable: false
                });
            }

            // Predictions
            if (enc.predictions && enc.predictions.length > 0) {
                const p = enc.predictions[0];
                reports.push({
                    id: `PRED-${p.prediction_id}`,
                    encId: enc.encounter_id.toString(),
                    title: "KidneyNet AI Diagnostic",
                    category: "AI_INFERENCE",
                    date: p.created_at.toISOString(),
                    doctorName: "KidneyNet Engine (Auto)",
                    isRead: true,
                    fileSize: "450 KB",
                    summary: `Automated inference result. AI flagged as ${p.predicted_label}.`,
                    highlight: { label: "CKD Risk", value: p.risk_score ? `${Math.round(Number(p.risk_score) * 100)}%` : 'Unknown', isAbnormal: p.predicted_label === 'CKD' },
                    deleteable: false
                });
            }

            // Clinical Notes
            if (enc.clinicalNotes && enc.clinicalNotes.length > 0) {
                for (const cn of enc.clinicalNotes) {
                    reports.push({
                        id: `CN-${cn.note_id}`,
                        encId: enc.encounter_id.toString(),
                        title: "Nephrology Consultation Notes",
                        category: "CLINICAL_NOTE",
                        date: cn.created_at.toISOString(),
                        doctorName: cn.doctor.user.full_name,
                        isRead: true,
                        fileSize: "850 KB",
                        summary: cn.note_text,
                        deleteable: false
                    });
                }
            }

            // User Self-Uploaded Reports
            if (enc.report) {
                reports.push({
                    id: `REP-${enc.report.report_id}`,
                    encId: enc.encounter_id.toString(),
                    title: "Custom Patient Report",
                    category: "OTHER",
                    date: enc.report.created_at.toISOString(),
                    doctorName: user.full_name,
                    isRead: true,
                    fileSize: "2.5 MB",
                    summary: enc.report.summary,
                    recommendations: enc.report.recommendations,
                    deleteable: true
                });
            }
        }

        return NextResponse.json({ success: true, reports: serialize(reports) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const created = await prisma.patientEncounter.create({
            data: {
                patient_id: user.patient.patient_id,
                entered_by_user_id: user.user_id,
                notes: 'Self-uploaded custom report',
                report: {
                    create: {
                        summary: body.summary || 'Custom patient summary',
                        recommendations: body.recommendations || 'No specific recommendations provided.',
                        pdf_url: ''
                    }
                }
            },
            include: { report: true }
        });

        return NextResponse.json({ success: true, report: serialize(created.report) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
