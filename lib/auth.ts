import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

interface TypedUser {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    finishedOnboarding?: boolean;
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? "",
            profile(profile: {
                sub: string;
                given_name?: string;
                family_name?: string;
                email: string;
            }) {
                return {
                    id: profile.sub,
                    firstName: profile.given_name ?? "",
                    lastName: profile.family_name ?? "",
                    email: profile.email,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                const typedUser = user as TypedUser;
                token.firstName = typedUser.firstName;
                token.lastName = typedUser.lastName;
                token.firstTimeUser = !typedUser.finishedOnboarding;
            } else {
                // On subsequent token refreshes (e.g. via update())
                // Re-fetch the latest user record from the database.
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: { finishedOnboarding: true },
                });
                if (dbUser) {
                    token.firstTimeUser = !dbUser.finishedOnboarding;
                }
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.firstName = token.firstName ?? "";
                session.user.lastName = token.lastName ?? "";
                session.user.firstTimeUser = token.firstTimeUser;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const getServerAuthSession = () => getServerSession(authOptions);
