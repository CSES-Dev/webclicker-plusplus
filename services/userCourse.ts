"use server";
import prisma from "@/lib/prisma";

export async function addUserToCourse(courseId: number, userId: number ){
    const existingUser = await prisma.userCourse.findFirst({
        where: {
            userId: userId,
            courseId: courseId,
        }
    })
    if (!existingUser){
        await prisma.userCourse.create({
            data: {
                userId,
                courseId,
            }
        })
    }
    else{
        return {error: "User is already enrolled in this course"}
    }
}