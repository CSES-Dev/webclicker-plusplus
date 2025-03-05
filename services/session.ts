"use server";
import type { CourseSession, QuestionType } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function getCourseSessionByDate(
    courseId: number,
    date: Date,
): Promise<CourseSession | null> {
    const dateString = date.toISOString().split("T")[0]; // Extract the date part in 'YYYY-MM-DD' format

    return prisma.courseSession.findFirst({
        where: {
            courseId,
            startTime: {
                gte: new Date(dateString + "T00:00:00.000Z"),
                lt: new Date(dateString + "T23:59:59.999Z"),
            },
        },
    });
}

export async function getQuestionsForSession(sessionId: number) {
    const session = await prisma.courseSession.findUnique({
        where: { id: sessionId },
        include: {
            questions: {
                include: { options: true, responses: true },
                orderBy: { id: "asc" },
            },
        },
    });

    return session?.questions ?? [];
}

export async function createWildcardQuestion(
    sessionId: number,
    position: number,
    questionType: QuestionType,
) {
    return prisma.question.create({
        data: {
            sessionId,
            position,
            text: "Refer to the board",
            type: questionType,
            options: {
                create: [
                    { text: "A", isCorrect: true },
                    { text: "B", isCorrect: true },
                    { text: "C", isCorrect: true },
                    { text: "D", isCorrect: true },
                ],
            },
        },
        include: {
            options: true,
        },
    });
}
