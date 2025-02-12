import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    console.log("\n=== MIDDLEWARE EXECUTION START ===");
    console.log("Request path:", request.nextUrl.pathname);
    
    // Debug environment variables
    console.log("Environment check:", {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        secretValue: process.env.NEXTAUTH_SECRET?.slice(0, 5) + "...", // Only log first 5 chars
        hasUrl: !!process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
    });
    
    try {
        const token = await getToken({ 
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production',
            cookieName: "next-auth.session-token"
        });
        
        console.log("Token details:", {
            exists: !!token,
            tokenValue: token,
            cookieHeader: request.headers.get('cookie')
        });
        
        const isAuthenticated = !!token;
        console.log("Is authenticated:", isAuthenticated);
        
        const publicPaths = ["/login", "/signup/name"];
        const isPublicPath = publicPaths.some((path) => 
            request.nextUrl.pathname.startsWith(path)
        );
        
        if (isAuthenticated && request.nextUrl.pathname === "/login") {
            // Explicitly check if isNew is true, otherwise treat as existing user
            const isNewUser = token.isNew === true;
            console.log("Is new user:", isNewUser);
            
            if (isNewUser) {
                return NextResponse.redirect(new URL("/signup/name", request.url));
            } else {
                // If not explicitly marked as new, redirect to dashboard
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }
        
    } catch (error) {
        console.error("Middleware error:", error);
    }
    
    console.log("=== MIDDLEWARE EXECUTION END ===\n");
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/login',
        '/dashboard',
        '/signup/:path*',
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|public).*)'
    ]
};