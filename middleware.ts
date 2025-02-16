// // import { withAuth } from 'next-auth/middleware'

// // export default withAuth({
// //     callbacks: {
// //         authorized: async({req,token}){
// //             if(req.nextURL.pathname.startsWith("/dashboard")){
// //                 return !!token
// //             }
// //         }
// //     }
// // })
// // // needs to be changed to be more specific between lecture,student,non-signed in user
// // export const config = { matcher: ['/dashboard:path*'] }

// import { withAuth } from 'next-auth/middleware'
// import { NextResponse } from 'next/server'

// // Option 1: Simple authentication check
// export default withAuth(
//   // `withAuth` augments your `Request` with the user's token.
//   function middleware(req) {
//     const path = req.nextUrl.pathname
//     const token= req.nextauth.token

//     // no token and trying to access protected rotues
//     if (!token && (
//         path.startsWith('/dashboard')
//     )){
//         const baseUrl = req.nextUrl.origin
//         const loginUrl = new URL('login',baseUrl)
//         loginUrl.searchParams.set('from', 'restricted')
//         loginUrl.searchParams.set('callbackUrl', req.url)
//         return NextResponse.redirect(loginUrl)
//     }
//     return NextResponse.next()
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         const path = req.nextUrl.pathname

//         if (path.startsWith("/dashboard")) {
//           return !!token
//         }

//         return true
//       }
//     }
//   }
// )

// export const config = {
//     matcher: [
//         '/dashboard/:path*',
//         '/student/:path*',
//         '/lecture/:path*'
//     ]
// }

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import prisma from "./lib/prisma";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req: req });
    const path = req.nextUrl.pathname;

    // check if there is valid session
    if (!token || !token.email) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }
    if (token) {
        // Check firstTimeUser flag
        if (token.firstTimeUser && req.nextUrl.pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/signup/name', req.url));
        }
        
        if (!token.firstTimeUser && req.nextUrl.pathname === '/signup/name') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    return NextResponse.next();
}
export const config = {
    matcher: ["/dashboard/:path*", "/signup/name", "/signup/finish"],
};
