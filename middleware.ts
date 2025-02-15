// import { withAuth } from 'next-auth/middleware'



// export default withAuth({
//     callbacks: {
//         authorized: async({req,token}){
//             if(req.nextURL.pathname.startsWith("/dashboard")){
//                 return !!token
//             }
//         }
//     }
// })
// // needs to be changed to be more specific between lecture,student,non-signed in user
// export const config = { matcher: ['/dashboard:path*'] }

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Option 1: Simple authentication check
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        if (path.startsWith("/dashboard")) {
          return !!token
        }
        
        return true
      }
    }
  }
)

export const config = { 
    matcher: [
        '/dashboard/:path*',
        '/student/:path*',
        '/lecture/:path*'
    ] 
}