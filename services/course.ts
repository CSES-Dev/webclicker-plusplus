"use server";
import prisma from "@/lib/prisma";
import { Course } from "@prisma/client";
import { addUserToCourse } from "./userCourse";

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
type AddCourseResult = Course | { error: string };

export async function addCourse(
    name: string,
    days: string[],
    color: string,
    startTime: string,
    endTime: string,
): Promise<AddCourseResult> {
    // Check if a course with the same code already exists
    let i = 0;
    let code: string | null = null;
    while (i < 100) {
        // Limit to 100 iterations - Prevent infinite loop with unbounded search
        let tempCode = String(Math.round(Math.random() * (10e5 - 1)));
        if (
            !(await prisma.course.findFirst({
                where: {
                    code: tempCode,
                },
            }))
        ) {
            code = tempCode;
            break;
        }
        i++;
    }
    if (!code) {
        return { error: "Could not find a unique code" };
    }
    const newCourse = await prisma.course.create({
        data: {
            title: name,
            code: code,
            color,
            Schedule: {
                create: [
                    {
                        dayOfWeek: days,
                        startTime,
                        endTime,
                    },
                ],
            },
        },
        include: { Schedule: true, users: true },
    });

    const response = await addUserToCourse(newCourse.id, 1, "LECTURER");
    if (response?.error) {
        console.log("User course link failed. Deleting course to rollback");
        await prisma.course.delete({ where: { id: newCourse.id } });
    }

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
