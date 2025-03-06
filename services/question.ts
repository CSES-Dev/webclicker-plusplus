"use server";
import { QuestionType } from "@prisma/client";
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
