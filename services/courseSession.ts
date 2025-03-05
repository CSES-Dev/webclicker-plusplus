"use server";
import { CourseSession } from "@prisma/client";
import prisma from "@/lib/prisma";

type GetOrCreateCourseSessionResult = CourseSession | { error: string };

export async function getOrCreateCourseSession(
    courseId: number,
    start: Date,
): Promise<GetOrCreateCourseSessionResult> {
    try {
        const courseSessions : CourseSession[] = await prisma.courseSession.findMany({
            where: { courseId, startTime: start },
        });
        
        for (const session of courseSessions){
            if (session.endTime == null) return session;
        }

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
