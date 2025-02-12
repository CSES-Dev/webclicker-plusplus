"use server";
import prisma from "@/lib/prisma";

export async function getCourseWithCode(code: string) {
    return await prisma.course.findFirst({
        where: {
            code,
        },
    });
}

export async function getCourseWithId(courseId: number) {
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
        },
    });

    const schedule = await prisma.schedule.findFirst({
        where: {
            courseId,
        },
    });

    return {
        color: course?.color,
        title: course?.title,
        days: schedule?.dayOfWeek,
        startTime: schedule?.startTime,
        endTime: schedule?.endTime,
    };
}
type AddCourseResult =
    | { id: number; title: string; code: string; color: string; createdAt: Date; updatedAt: Date }
    | { error: string };

export async function addCourse(
    name: string,
    code: string,
    days: string[],
    color: string,
    startTime: string,
    endTime: string,
): Promise<AddCourseResult> {
    // Check if a course with the same code already exists
    const existingCourse = await prisma.course.findFirst({
        where: {
            code,
        },
    });

    if (existingCourse) {
        return { error: "Course with this code already exists" };
    }

    // If no existing course, create a new one
    const newCourse = await prisma.course.create({
        data: {
            title: name,
            code,
            color,
            schedules: {
                create: [
                    {
                        dayOfWeek: days,
                        startTime,
                        endTime,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    return newCourse;
}

export async function getAllCourses() {
    try {
        const courses = await prisma.course.findMany();
        return courses;
    } catch (error) {
        return { error };
    }
}
