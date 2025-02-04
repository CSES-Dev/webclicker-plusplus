"use server";
import prisma from "@/lib/prisma";

export async function getCourseWithCode(code:string) {
    return await prisma.course.findFirst({
        where: {
            code
        },
    });
}

export async function getCourseWithId(courseId: number){
    const course = await prisma.course.findFirst({
        where:{
            id: courseId
        }
    })

    const schedule = await prisma.schedule.findFirst({
        where:{
            courseId
        }
    })

    return {
        "color": course?.color,
        "title": course?.title,
        "days": schedule?.dayOfWeek,
        "startTime": schedule?.startTime,
        "endTime": schedule?.endTime
    }
}