"use server";
import { CourseSession } from "@prisma/client";
import prisma from "@/lib/prisma";

type GetOrCreateCourseSessionResult = CourseSession | { error: string };

export async function getOrCreateCourseSession(
    courseId: number,
    start: Date,
): Promise<GetOrCreateCourseSessionResult> {
    try {
        const courseSession = await prisma.courseSession.findFirst({
            where: { courseId, startTime: start, endTime: null },
        });

        if (courseSession) return courseSession;

        return await prisma.courseSession.create({
            data: {
                courseId,
                startTime: start,
            },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error finding or creating course session." };
    }
}
