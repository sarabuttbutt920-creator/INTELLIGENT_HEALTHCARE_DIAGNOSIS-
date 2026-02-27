import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_medi_intel_2026';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const doctor = await prisma.doctor.findUnique({
            where: { user_id: BigInt(decoded.user_id) },
            include: { user: true }
        });

        if (!doctor) {
            return NextResponse.json({ success: false, message: "Doctor profile not found." }, { status: 404 });
        }

        // Serialize BigInts before sending to client
        const bigIntToNum = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: bigIntToNum(doctor) }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Session invalid." }, { status: 401 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user_id = BigInt(decoded.user_id);

        const body = await req.json();

        // 1. Prepare User Data (Update Basic Profile Info)
        const userData: any = {};
        if (body.full_name) userData.full_name = body.full_name;
        if (body.phone !== undefined) userData.phone = body.phone;
        // Optionally email update if allowed, but typically email is fixed or requires verification mechanism.

        // 2. Prepare Doctor Data
        const docData: any = {};
        const safeAssign = (key: string, val: any) => { if (val !== undefined) docData[key] = val; };

        safeAssign("gender", body.gender);
        safeAssign("date_of_birth", body.date_of_birth ? new Date(body.date_of_birth) : undefined);
        safeAssign("nationality", body.nationality);
        safeAssign("profile_photo_url", body.profile_photo_url);

        safeAssign("clinic_address", body.clinic_address);
        safeAssign("hospital_name", body.hospital_name);
        safeAssign("consultation_hours", body.consultation_hours);
        safeAssign("bio", body.bio);
        safeAssign("fee", body.fee ? parseFloat(body.fee) : undefined);

        safeAssign("license_no", body.license_no);
        safeAssign("license_expiry_date", body.license_expiry_date ? new Date(body.license_expiry_date) : undefined);
        safeAssign("license_cert_url", body.license_cert_url);

        safeAssign("degree", body.degree);
        safeAssign("university_name", body.university_name);
        safeAssign("graduation_year", body.graduation_year ? parseInt(body.graduation_year) : undefined);
        safeAssign("degree_cert_url", body.degree_cert_url);

        safeAssign("specialization", body.specialization);
        safeAssign("sub_specialty", body.sub_specialty);
        safeAssign("experience_years", body.experience_years ? parseInt(body.experience_years) : undefined);
        safeAssign("professional_memberships", body.professional_memberships);
        safeAssign("govt_id_url", body.govt_id_url);

        // Verification Status Check Logic
        // If a draft profile hits "submit", move to SUBMITTED
        if (body.action === "SUBMIT_FOR_REVIEW") {
            docData.verification_status = "SUBMITTED";
        }

        await prisma.$transaction(async (tx) => {
            if (Object.keys(userData).length > 0) {
                await tx.user.update({ where: { user_id }, data: userData });
            }
            if (Object.keys(docData).length > 0) {
                await tx.doctor.update({ where: { user_id }, data: docData });
            }
        });

        return NextResponse.json({ success: true, message: "Profile successfully updated." }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, message: error.message || "Failed to update profile." }, { status: 500 });
    }
}
