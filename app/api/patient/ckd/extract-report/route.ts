import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // Forward to the Python Flask backend for OCR extraction
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        const response = await fetch('http://127.0.0.1:5000/api/ckd/extract-report', {
            method: 'POST',
            body: backendFormData,
        });

        if (!response.ok) {
            let errorMsg = 'Failed to process report on backend server.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorData.message || errorMsg;
            } catch (e) {
                errorMsg = await response.text() || errorMsg;
            }
            return NextResponse.json({ success: false, error: errorMsg }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('OCR Proxy Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to connect to the prediction backend. Is the Python server running?' },
            { status: 500 }
        );
    }
}
