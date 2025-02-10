"use server";
import prisma from "@/lib/prisma";

export async function getCourseWithCode(code: string) {
    return await prisma.course.findFirst({
        where: {
            code,
        },
    });
}

type AddCourseResult =
    | { id: number; title: string; code: string; color: string; createdAt: Date; updatedAt: Date }
    | { error: string };

export async function addCourse(
    name: string,
    code: string,
    // days: string[],
    color: string,
    //startTime: string,
    // endTime: string,
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
            // days: days,  // Assuming days is an array of strings
            color,
            // startTime: startTime,
            // endTime: endTime,
            //   users: ,
            //   sessions: ,
        },
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
