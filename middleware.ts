import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const path = req.nextUrl.pathname;
    console.log("Middleware token:", token);
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // If onboarding is not finished and user is trying to access dashboard, redirect to onboarding
    if (token.firstTimeUser && path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/signup/name", req.url));
    }

    // If onboarding is finished and user is trying to access the signup page, redirect to dashboard
    if (!token.firstTimeUser && path.startsWith("/signup/name")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/signup/name", "/signup/finish"],
};
