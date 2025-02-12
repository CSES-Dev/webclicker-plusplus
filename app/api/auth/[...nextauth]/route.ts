import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session as NextAuthSession } from "next-auth";
import NextAuth, { DefaultSession, User, getServerSession } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import Email from "next-auth/providers/email";

type Account = {
    provider: string;
    type: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: string | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
    userId: string;
};

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            isNew: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

// Create a custom adapter by overriding createUser, linkAccount, and createSession inline.
const customAdapter = {
    ...PrismaAdapter(prisma),

    async createUser(user: User) {
        const nameParts = user.name?.split(" ") ?? [];
        const firstName = nameParts[0] || "Unknown";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

        const createdUser = await prisma.user.create({
            data: {
                email: user.email!,
                firstName,
                lastName,
            },
        });

        return {
            id: createdUser.id.toString(),
            name: lastName ? `${firstName} ${lastName}` : firstName,
            email: createdUser.email,
            emailVerified: null,
        } as AdapterUser;
    },

    async linkAccount(account: Account) {
        return prisma.account.create({
            data: {
                provider: account.provider,
                type: account.type,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token ?? null,
                access_token: account.access_token ?? null,
                expires_at: account.expires_at ? parseInt(account.expires_at, 10) : null,
                token_type: account.token_type ?? null,
                scope: account.scope ?? null,
                id_token: account.id_token ?? null,
                session_state: account.session_state ?? null,
                userId: parseInt(account.userId, 10),
            },
        });
    },

    async createSession({
        sessionToken,
        userId,
        expires,
    }: {
        sessionToken: string;
        userId: string;
        expires: Date;
    }) {
        const createdSession = await prisma.session.create({
            data: {
                sessionToken,
                userId: parseInt(userId, 10),
                expires,
            },
        });
        return {
            ...createdSession,
            userId: createdSession.userId.toString(),
        };
    },
};

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    adapter: customAdapter,
    callbacks: {
        async signIn({ user, account, profile, credentials }) {
            return true;
        },
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id;
                const dbUser = await prisma.user.findUnique({
                    where: { id: parseInt(user.id, 10) },
                    select: { id: true },
                });
                token.isNew = !dbUser;
            }
            return token;
        },
        async session({ session, token }: { session: NextAuthSession; token: JWT }) {
            // if (session.user && token?.id) {
            //     session.user.id = token.id;
            // }
            // return session;
            if (session.user && token?.id) {
                session.user.id = token.id;

                // Check if this is the user's first session (newly created account)
                const dbUser = await prisma.user.findUnique({
                    where: { id: parseInt(session.user.id, 10) },
                    select: { id: true },
                });

                session.user.isNew = !dbUser;
            }
            return session;
        },
    },
    // pages: {
    //     signIn: "signup/name",
    // },
};

const handler = NextAuth(authOptions);

export const getServerAuthSession = () => getServerSession(authOptions);
export { handler as GET, handler as POST };
