"use server";
import { CourseSession, Question, QuestionType } from "@prisma/client";
import { questionTypes } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { findActiveCourseSessions } from "./courseSession";
import { FindActiveCourseSessionsResult } from "./courseSession";

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
        return await prisma.question.create({
            data: {
                sessionId,
                text,
                type: prismaQuestionTypes[type],
                options: {
                    create: answerChoices.map((option) => {
                        return {
                            text: option,
                            isCorrect: correctAnswers.includes(option),
                        };
                    }),
                },
            },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error creating question." };
    }
}

export type FindQuestionsByCourseSessionResult = 
    (Question & { options: { id: number; text: string; isCorrect: boolean }[] })[] 
    | { error: string } 
    | null;

export async function findQuestionsByCourseSession(
    courseId: number,
    start: Date,
): Promise<FindQuestionsByCourseSessionResult> {
    try {
        const activeSessions = await findActiveCourseSessions(courseId, start);
        if (!activeSessions || "error" in activeSessions) {
            return { error: "Cannot find active sessions" };
        }

        const questions = await Promise.all(
            activeSessions.map(async (session) => {
                return prisma.question.findMany({
                    where: { sessionId: session.id },
                    include: {
                        options: true,
                    },
                });
            })
        );

        return questions.flat();
    } catch (err) {
        console.error(err);
        return { error: "Error finding questions for course session" };
    }
}
