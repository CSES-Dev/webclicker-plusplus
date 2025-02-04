"use server";
import prisma from "@/lib/prisma";

export async function getCourseWithCode(code:string) {
    return await prisma.course.findFirst({
        where: {
            code: code,
        },
    });
}

export async function getCourseWithId(courseId: number){
    const courses = await prisma.course.findFirst({
        where:{
            id: courseId
        }
    })
    
    return {
        "color": courses?.color,
        "title": courses?.title
    }
}