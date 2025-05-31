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

/**
 * Creates a new course session
 */
export async function createCourseSession(courseId: number, date: string) {
    try {
        const newSession = await prisma.courseSession.create({
            data: {
                courseId,
                startTime: new Date(date),
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
export async function endCourseSession(sessionId: number, date: Date) {
    try {
        const endedSession = await prisma.courseSession.update({
            where: {
                id: sessionId,
            },
            data: {
                endTime: date,
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
            startTime: start,
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

export async function pauseOrResumeCourseSession(sessionId: number, paused: boolean) {
    try {
        await prisma.courseSession.update({
            where: {
                id: sessionId,
            },
            data: {
                paused,
            },
        });
        return true;
    } catch (error) {
        console.error("Error pausing/resuming course session:", error);
        throw new Error("Failed to pause/resume course session");
    }
}

export async function getSessionPauseState(sessionId: number) {
    try {
        const session = await prisma.courseSession.findUnique({
            where: {
                id: sessionId,
            },
        });
        return session?.paused ?? false;
    } catch (error) {
        console.error("Error getting session pause state:", error);
        throw new Error("Failed to get session pause state");
    }
}
