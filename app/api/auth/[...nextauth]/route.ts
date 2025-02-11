import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import NextAuth, { User, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";

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
        };
    },

    async linkAccount(account: any) {
        return prisma.account.create({
            data: {
                provider: account.provider!,
                type: account.type!,
                providerAccountId: account.providerAccountId!,
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

    async createSession(session: any) {
        const createdSession = await prisma.session.create({
            data: {
                sessionToken: session.sessionToken,
                userId: parseInt(session.userId, 10),
                expires: session.expires,
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
    adapter: customAdapter,
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }: { session: any; token: any }) {
            if (session.user && token?.id) {
                session.user.id = token.id;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export const getServerAuthSession = () => getServerSession(authOptions);
export { handler as GET, handler as POST };
