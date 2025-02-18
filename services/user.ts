"use server";

import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export async function getUsers() {
    return await prisma.user.findMany();
}

export async function getUser(where: Prisma.UserWhereUniqueInput) {
    return await prisma.user.findUnique({
        where,
    });
}

// DON'T create this for tables that you don't actually need to potentially delete things from
// Could be used accidentally or misused maliciously to get rid of important data
export async function deleteUser(id: string) {
    return await prisma.user.delete({
        where: { id },
    });
}
