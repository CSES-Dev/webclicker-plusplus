"use server";
import { CourseSession } from "@prisma/client";
import prisma from "@/lib/prisma";

type FindCourseSessionResult = CourseSession | { error: string } | null;

export async function findCourseSession(
    courseId: number,
    start: Date,
): Promise<FindCourseSessionResult> {
    try {
        return await prisma.courseSession.findFirst({
            where: { courseId, startTime: start },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error finding course session." };
    }
}

export async function createCourseSession(courseId: number, start: Date) {
    try {
        if (await findCourseSession(courseId, start))
            return { error: "Course session already exists." };
        return await prisma.courseSession.create({
            data: {
                courseId,
                startTime: start,
            },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error creating course session." };
    }
}
