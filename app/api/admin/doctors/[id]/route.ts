import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const doctor_id = BigInt(params.id);

        const doctor = await prisma.doctor.findUnique({
            where: { doctor_id },
            include: {
                user: {
                    select: {
                        full_name: true,
                        email: true,
                        phone: true,
                        is_active: true,
                        created_at: true,
                        last_login_at: true,
                    }
                }
            }
        });

        if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

        return NextResponse.json({
            doctor_id: doctor.doctor_id.toString(),
            user_id: doctor.user_id.toString(),
            full_name: doctor.user.full_name,
            email: doctor.user.email,
            phone: doctor.user.phone,
            is_active: doctor.user.is_active,
            verification_status: doctor.verification_status,
            specialization: doctor.specialization,
            license_no: doctor.license_no,
            hospital_name: doctor.hospital_name,
            experience_years: doctor.experience_years,
            fee: doctor.fee.toString(),
            bio: doctor.bio,
            profile_photo_url: doctor.profile_photo_url,
            created_at: doctor.created_at,
            last_login_at: doctor.user.last_login_at,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch doctor details" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const doctor_id = BigInt(params.id);
        const body = await req.json();

        const doctor = await prisma.doctor.findUnique({ where: { doctor_id } });
        if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

        // Build Data sets mapping correctly to the nested Tables
        const doctorData: any = {};
        const userData: any = {};

        if (body.verification_status) doctorData.verification_status = body.verification_status;
        if (body.specialization) doctorData.specialization = body.specialization;
        if (body.hospital_name) doctorData.hospital_name = body.hospital_name;
        if (body.license_no) doctorData.license_no = body.license_no;

        if (typeof body.is_active === "boolean") userData.is_active = body.is_active;
        if (body.full_name) userData.full_name = body.full_name;
        if (body.email) userData.email = body.email;
        if (body.phone !== undefined) userData.phone = body.phone;

        // Perform parallel saves transactionally
        await prisma.$transaction(async (tx) => {
            if (Object.keys(doctorData).length > 0) {
                await tx.doctor.update({ where: { doctor_id }, data: doctorData });
            }
            if (Object.keys(userData).length > 0) {
                await tx.user.update({ where: { user_id: doctor.user_id }, data: userData });
            }
        });

        return NextResponse.json({ success: true, message: "Doctor profile updated." }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update doctor" }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const doctor_id = BigInt(params.id);

        const doctor = await prisma.doctor.findUnique({ where: { doctor_id } });
        if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

        // Delete permanently (Doctor profile first, then primary User profile)
        await prisma.$transaction(async (tx) => {
            await tx.doctor.delete({ where: { doctor_id } });
            await tx.user.delete({ where: { user_id: doctor.user_id } });
        });

        return NextResponse.json({ success: true, message: "Doctor entirely wiped from records." }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete doctor due to relational constraints." }, { status: 500 });
    }
}
