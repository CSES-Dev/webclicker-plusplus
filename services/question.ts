"use server";
import { Option, Question, QuestionType } from "@prisma/client";
import { findActiveCourseSessions } from "./courseSession";
import { questionTypes } from "@/lib/constants";
import prisma from "@/lib/prisma";

const prismaQuestionTypes = {
    "Multiple Choice": QuestionType.MCQ,
    "Select All": QuestionType.MSQ,
};

export async function addQuestionWithOptions(
    sessionId: number,
    text: string,
    type: (typeof questionTypes)[number],
    answerChoices: string[],
    correctAnswers: string[],
) {

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
        return activeSessions.reduce<(Question & { options: Option[] })[]>(
            (prev, curr) => [...prev, ...curr.questions],
            [],
        );
    } catch (err) {
        console.error(err);
        return { error: "Error finding questions for course session" };
    }
}


export async function updateQuestion(questionId: number, sessionId: number, text : string, type: (typeof questionTypes)[number], answerChoices: string[], correctAnswers: string[]) {
    try {
        await prisma.option.deleteMany({ where: { questionId } });
        return await prisma.question.update({
            where: { id: questionId },
            data: { sessionId,
                text,
                type: prismaQuestionTypes[type],
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
                },},
        });
    } catch (err) {
        console.error(err);
        return { error: "Error updating question." };
    }
}

export async function deleteQuestion(questionId: number) {
    try {
        await prisma.option.deleteMany({ where: { questionId } });
        return await prisma.question.delete({ where: { id: questionId } });
    } catch (err) {
        console.error(err);
        return { error: "Error deleting question." };
    }
}