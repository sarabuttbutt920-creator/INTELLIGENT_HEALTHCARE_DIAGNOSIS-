import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

/**
 * POST /api/patient/prediction/analyze-report
 *
 * Receives a medical file (image, PDF, DOCX) from the frontend,
 * forwards it as base64 JSON to the Flask /analyze-report endpoint,
 * which runs Google Gemini Vision analysis and returns extracted
 * clinical values + a full medical analysis.
 */
export async function POST(req: Request) {
    try {
        // ── Auth ───────────────────────────────────────────────────────────────
        const user = await getUserSession();
        if (!user || user.role !== 'PATIENT') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // ── Read multipart file ────────────────────────────────────────────────
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file provided.' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: `Unsupported file type: ${file.type}. Use PNG, JPG, PDF, or DOCX.` },
                { status: 400 }
            );
        }

        // Validate file size (max 20 MB)
        const MAX_BYTES = 20 * 1024 * 1024;
        if (file.size > MAX_BYTES) {
            return NextResponse.json(
                { success: false, message: 'File too large. Maximum size is 20 MB.' },
                { status: 400 }
            );
        }

        // ── Convert to base64 ──────────────────────────────────────────────────
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // ── Forward to Flask ───────────────────────────────────────────────────
        let flaskRes: Response;
        try {
            flaskRes = await fetch(`${FLASK_API_URL}/analyze-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_base64: base64,
                    file_name: file.name,
                    mime_type: file.type,
                }),
                signal: AbortSignal.timeout(90_000),   // 90s — Gemini may be slow
            });
        } catch (networkErr) {
            console.error('[analyze-report] Flask unreachable:', networkErr);
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'The AI analysis service is currently unavailable. ' +
                        'Make sure the Python Flask server is running on port 5000.',
                },
                { status: 503 }
            );
        }

        const data = await flaskRes.json();

        // ── Pass Gemini setup_required hint through ────────────────────────────
        if (!flaskRes.ok) {
            return NextResponse.json(data, { status: flaskRes.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('[analyze-report] Unexpected error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
