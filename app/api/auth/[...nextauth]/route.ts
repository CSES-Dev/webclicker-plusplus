import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session as NextAuthSession } from "next-auth";
import NextAuth, { DefaultSession, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";


export const authOptions: NextAuthOptions = {
    session:{
        strategy: "jwt"
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? "",
            profile(profile) {
                return {
                    id: profile.sub,
                    firstName: `${profile.given_name}`,
                    lastName: `${profile.family_name}`,
                    email: profile.email,
                };
            },
        }),
    ],
    callbacks:{
        async jwt({ token, user }){
            if(user) {
                token.id = user.id;
                const existingUser = await prisma.user.findUnique({
                    where: { email: token.email as string }
                });
                
                // Add firstTimeUser flag to token
                token.firstTimeUser = !existingUser;
            }

            return {...token, ...user}
        },
        // async jwt({ token, user }){
        //     if (token.email) {
        //         const userCourse = await prisma.userCourse.findFirst({
        //             where: {
        //                 user: {
        //                     email: token.email
        //                 }
        //             }
        //         })
        //         token.hasRole = !!userCourse
        //     }
        //     return {...token, ...user}
        // },
        async session({session, token}){
            if (session.user) {
                session.user.id = token.id as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
                (session as any).firstTimeUser = token.firstTimeUser;

            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export const getServerAuthSession = () => getServerSession(authOptions);
export { handler as GET, handler as POST };
