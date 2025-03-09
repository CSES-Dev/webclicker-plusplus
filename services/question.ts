"use server";
import { Option, Question, QuestionType } from "@prisma/client";
import { findActiveCourseSessions } from "./courseSession";
import { questionTypes } from "@/lib/constants";
import prisma from "@/lib/prisma";

export async function addQuestionWithOptions(
    sessionId: number,
    text: string,
    type: (typeof questionTypes)[number],
    answerChoices: string[],
    correctAnswers: string[],
) {
    const prismaQuestionTypes = {
        "Multiple Choice": QuestionType.MCQ,
        "Select All": QuestionType.MSQ,
    };

    try {
        const lastQuestion = await prisma.question.findFirst({
            where: { sessionId },
            orderBy: { position: "desc" },
        });
        const newPosition = lastQuestion ? lastQuestion.position + 1 : 0;

        return await prisma.question.create({
            data: {
                sessionId,
                text,
                type: prismaQuestionTypes[type],
                position: newPosition,
                options: {
                    create: [
                        ...correctAnswers.map((option) => ({
                            text: option,
                            isCorrect: true,
                        })),
                        ...answerChoices.map((option) => {
                            return {
                                text: option,
                                isCorrect: false,
                            };
                        }),
                    ],
                },
            },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error creating question." };
    }
}

export type FindQuestionsByCourseSessionResult =
    | (Question & { options: { id: number; text: string; isCorrect: boolean }[] })[]
    | { error: string }
    | null;

export async function findQuestionsByCourseSession(
    courseId: number,
    start: Date,
): Promise<FindQuestionsByCourseSessionResult> {
    try {
        const activeSessions = await findActiveCourseSessions(courseId, start);
        return activeSessions.reduce(
            (prev, curr) => [...prev, ...curr.questions],
            [] as (Question & { options: Option[] })[],
        );
    } catch (err) {
        console.error(err);
        return { error: "Error finding questions for course session" };
    }
}
