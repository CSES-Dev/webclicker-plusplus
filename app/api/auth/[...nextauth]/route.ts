import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session as NextAuthSession } from "next-auth";
import NextAuth, { DefaultSession, User, getServerSession } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import Email from "next-auth/providers/email";




export const authOptions: NextAuthOptions = {
    session:{
        strategy: "jwt"

    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? "",
            profile(profile) {
                return {
                    id: profile.sub,
                    name: `${profile.given_name} ${profile.family_name}`,
                    email: profile.email,
                    image: profile.picture,
                    role: profile.role ? profile.role : "user",
                };
            },
        }),
    ],
    callbacks:{
        async jwt({ token, user }){
            return{...token, ...user}
        },
        async session({session, token}){
            return session;
        }
        
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export const getServerAuthSession = () => getServerSession(authOptions);
export { handler as GET, handler as POST };
