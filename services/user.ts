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
