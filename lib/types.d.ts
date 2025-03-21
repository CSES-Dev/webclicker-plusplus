import { User } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: User & {
            firstTimeUser?: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT extends User {
        lastName?: string;
        firstName?: string;
        firstTimeUser?: boolean;
    }
}
