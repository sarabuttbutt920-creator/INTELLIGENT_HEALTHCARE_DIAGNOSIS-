import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { user_id: BigInt(id) },
            select: {
                user_id: true, full_name: true, email: true, phone: true, role: true, is_active: true, created_at: true, last_login_at: true
            }
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const dataToUpdate: any = {};
        if (body.full_name) dataToUpdate.full_name = body.full_name;
        if (body.email) dataToUpdate.email = body.email;
        if (body.phone !== undefined) dataToUpdate.phone = body.phone;
        if (body.role) dataToUpdate.role = body.role;
        if (body.is_active !== undefined) dataToUpdate.is_active = body.is_active;

        const updatedUser = await prisma.user.update({
            where: { user_id: BigInt(id) },
            data: dataToUpdate,
            select: {
                user_id: true, full_name: true, email: true, role: true, is_active: true, created_at: true
            }
        });
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.user.delete({ where: { user_id: BigInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        // Handle constraint failures (if the user has relations)
        return NextResponse.json({ error: "Failed to delete user" }, { status: 400 });
    }
}
