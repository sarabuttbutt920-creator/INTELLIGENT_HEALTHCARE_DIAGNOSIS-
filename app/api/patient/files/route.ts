import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const files = await prisma.medicalFile.findMany({
            where: {
                encounter: {
                    patient_id: user.patient.patient_id
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Map to frontend MedicalFile format
        const formattedFiles = files.map(f => {
            let category = "MEDICAL_REPORT";
            if (f.file_type === "SCAN_IMAGE") category = "MRI";
            else if (f.file_type === "OTHER") category = "XRAY"; // Just map roughly for now

            return {
                id: f.file_id.toString(),
                name: f.original_name || 'Uploaded File',
                size: 1024 * 1024, // Mock size as we don't store it in db right now, or we can use fs.statSync if needed
                type: f.mime_type || 'application/octet-stream',
                category: category,
                uploadDate: f.created_at.toISOString(),
                status: "UPLOADED",
                url: f.file_url
            };
        });

        return NextResponse.json({ success: true, files: formattedFiles });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT' || !user.patient) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const files = formData.getAll('file') as File[];
        const category = formData.get('category') as string || 'MEDICAL_REPORT';

        if (files.length === 0) {
            return NextResponse.json({ success: false, message: 'No files provided' }, { status: 400 });
        }

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // We need an encounter to attach to. Create a generic one for uploads.
        const encounter = await prisma.patientEncounter.create({
            data: {
                patient_id: user.patient.patient_id,
                entered_by_user_id: user.user_id,
                notes: 'Uploaded medical documents'
            }
        });

        const uploadedRecords = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, buffer);

            const fileUrl = `/uploads/${fileName}`;
            let fileType = 'OTHER';
            if (category === 'MRI' || category === 'XRAY') {
                fileType = 'SCAN_IMAGE';
            } else if (category === 'MEDICAL_REPORT') {
                fileType = 'LAB_REPORT';
            }

            const newFile = await prisma.medicalFile.create({
                data: {
                    encounter_id: encounter.encounter_id,
                    uploaded_by_user_id: user.user_id,
                    file_type: fileType as any,
                    file_url: fileUrl,
                    original_name: file.name,
                    mime_type: file.type
                }
            });

            uploadedRecords.push(newFile);
        }

        return NextResponse.json({ success: true, message: 'Files uploaded successfully' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
