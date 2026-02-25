import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Explicit Protected Boundaries
    const isAdminPath = pathname.startsWith('/admin');
    const isDoctorPath = pathname.startsWith('/doctor');
    const isPatientPath = pathname.startsWith('/patient');

    const isAuthPath = pathname === '/login' || pathname === '/signup';

    if (!isAdminPath && !isDoctorPath && !isPatientPath && !isAuthPath) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        if (isAdminPath || isDoctorPath || isPatientPath) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    try {
        // Decode JWT payload loosely directly at Edge via JS (No Secret needed for decoding alone)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        const role = decoded.role;

        // Redirect valid authenticated users away from raw auth pages
        if (isAuthPath) {
            if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
            if (role === 'DOCTOR') return NextResponse.redirect(new URL('/doctor', request.url));
            if (role === 'PATIENT') return NextResponse.redirect(new URL('/patient', request.url));
        }

        // Enforce stringent role boundaries
        if (isAdminPath && role !== 'ADMIN') {
            return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
        }
        if (isDoctorPath && role !== 'DOCTOR') {
            return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
        }
        if (isPatientPath && role !== 'PATIENT') {
            return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
        }

        return NextResponse.next();

    } catch (e) {
        // Fallback: If token parsing fails abruptly, trash session and reroute
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
}

export const config = {
    matcher: ['/admin/:path*', '/doctor/:path*', '/patient/:path*', '/login', '/signup'],
};
