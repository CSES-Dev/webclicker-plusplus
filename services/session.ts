"use server";
import type { CourseSession, QuestionType } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import prisma from "@/lib/prisma";

export async function getCourseSessionByDate(
    courseId: number,
    date: string,
): Promise<CourseSession | null> {
    // Find a session that:
    // 1. Belongs to the specified course
    // 2. Started on the day
    // 3. Has no end time (still active)
    const dayStart = startOfDay(new Date(date));
    const dayEnd = endOfDay(new Date(date));

    return prisma.courseSession.findFirst({
        where: {
            courseId,
            startTime: {
                gte: dayStart,
                lte: dayEnd,
            },
            endTime: null,
        },
    });
}

export async function getQuestionsForSession(sessionId: number) {
    const session = await prisma.courseSession.findUnique({
        where: { id: sessionId },
        include: {
            questions: {
                include: { options: true, responses: true },
                orderBy: { position: "asc" },
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
    return await prisma.$transaction(async (tx) => {
        await tx.question.updateMany({
            where: {
                sessionId,
                position: { gte: position },
            },
            data: {
                position: { increment: 1 },
            },
        });

        const newQuestion = await tx.question.create({
            data: {
                session: { connect: { id: sessionId } },
                text: "Refer to the board",
                type: questionType,
                position,
                options: {
                    create: [
                        { text: "A", isCorrect: false },
                        { text: "B", isCorrect: false },
                        { text: "C", isCorrect: false },
                        { text: "D", isCorrect: false },
                        { text: "E", isCorrect: false },
                    ],
                },
            },
            include: { options: true },
        });

        return newQuestion;
    });
}

export async function getQuestionById(questionId: number) {
    try {
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                options: true,
                responses: true,
            },
        });
        return question;
    } catch (error) {
        console.error("Error fetching question by ID:", error);
        throw error;
    }
}

export async function getAllSessionIds(courseId: number) {
    try {
        const sessions = await prisma.courseSession.findMany({
            where: {
                courseId,
            },
            select: {
                id: true,
            },
        });

        return sessions.map((session) => session.id);
    } catch (error) {
        console.error(error);
        return { error: "Error fetching sessions" };
    }
}

export async function getSessionIdsByDate(courseId: number, date: Date) {
    try {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const sessions = await prisma.courseSession
            .findMany({
                where: {
                    courseId,
                    startTime: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
                select: {
                    id: true,
                },
            })
            .then((res) => res.map((session) => session.id));

        return sessions;
    } catch (error) {
        console.error(error);
        return { error: "Error fetching session information" };
    }
}
