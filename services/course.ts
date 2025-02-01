"use server";
import prisma from "@/lib/prisma";

export async function getCourseWithCode(code:string) {
    return await prisma.course.findFirst({
        where: {
            code: code,
        },
    });
}