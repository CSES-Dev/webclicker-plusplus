import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session as NextAuthSession } from "next-auth";
import NextAuth, { DefaultSession, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
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
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                const typedUser = user as {
                    id: string;
                    email?: string;
                    firstName?: string;
                    lastName?: string;
                    finishedOnboarding?: boolean;
                };
                console.log("User finishedOnboarding: " + typedUser.finishedOnboarding);
                token.firstName = typedUser.firstName;
                token.lastName = typedUser.lastName;
                token.firstTimeUser = !typedUser.finishedOnboarding;

                // 1) finishedOnboarding false beginning -> true once you sign in
                // 2) finishedOnboarding == TRUE
            } else {
                // On subsequent token refreshes (e.g. via update())
                // Re-fetch the latest user record from the database.
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: { finishedOnboarding: true },
                });
                if (dbUser) {
                    console.log("User finishedOnboarding (DB lookup):", dbUser.finishedOnboarding);
                    token.firstTimeUser = !dbUser.finishedOnboarding;
                }
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Session callback token:", token);
            if (session.user) {
                session.user.id = token.id;
                session.user.firstName = token.firstName!;
                session.user.lastName = token.lastName!;
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
