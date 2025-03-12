"use server";
import { CourseSession } from "@prisma/client";
import prisma from "@/lib/prisma";
import { formatDateToISO } from "@/lib/utils";

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

/**
 * Creates a new course session
 */
export async function createCourseSession(courseId: number) {
    try {
        const newSession = await prisma.courseSession.create({
            data: {
                courseId,
                startTime: new Date(formatDateToISO(new Date())),
            },
        });
        return newSession;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to create course session");
    }
}

/**
 * Ends an active course session
 */
export async function endCourseSession(sessionId: number) {
    try {
        const endedSession = await prisma.courseSession.update({
            where: {
                id: sessionId,
            },
            data: {
                endTime: new Date(),
                activeQuestionId: null,
            },
        });

        return endedSession;
    } catch (error) {
        console.error("Error ending course session:", error);
        throw new Error("Failed to end course session");
    }
}

export type FindActiveCourseSessionsResult = CourseSession[] | { error: string } | null;

export async function findActiveCourseSessions(courseId: number, start: Date) {
    return await prisma.courseSession.findMany({
        where: {
            courseId,
            startTime: {
                gte: new Date(start.setHours(0, 0, 0, 0)),
                lt: new Date(start.setHours(23, 59, 59, 999)),
            },
            endTime: null,
        },
        include: {
            questions: {
                include: {
                    options: true,
                },
            },
        },
    });
}
