import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth"; // Added Session import
import { getServerSession } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";


export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? "",
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user && typeof user.id === "string") {
                token.id = user.id;
            }
            return token;
        },

        session({ session, token }: {session: any, token: any}) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    adapter: PrismaAdapter(prisma),
};

const handler = NextAuth(authOptions);

export const getServerAuthSession = () => getServerSession(authOptions);
export { handler as GET, handler as POST };
