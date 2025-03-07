"use server";

import prisma from "@/lib/prisma";

/**
 * Finds an active course session for a given course ID
 * Active session is one that:
 * 1. Has no end date
 * 2. Started on the same day as the current request
 */
export async function findActiveCourseSession(courseId: number) {
    // Get the current date and reset the time to start of day
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999,
    );

    try {
        // Find a session that:
        // 1. Belongs to the specified course
        // 2. Has no end time (still active)
        // 3. Started today
        const activeSession = await prisma.courseSession.findFirst({
            where: {
                courseId,
                endTime: null,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                questions: true,
            },
        });

        return activeSession;
    } catch (error) {
        console.error("Database error when finding active course session:", error);
        throw new Error("Failed to retrieve active course session");
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
                startTime: new Date(),
            },
        });

        return newSession;
    } catch (error) {
        console.error("Error creating new course session:", error);
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
            },
        });

        return endedSession;
    } catch (error) {
        console.error("Error ending course session:", error);
        throw new Error("Failed to end course session");
    }
}