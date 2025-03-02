"use server";
import { QuestionType } from "@prisma/client";
import { questionTypes } from "@/lib/constants";
import prisma from "@/lib/prisma";

export async function addQuestionWithOptions(
    sessionId: number,
    text: string,
    type: (typeof questionTypes)[number],
    answerChoices: string[],
    correctAnswers: string[]
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
                    create: answerChoices.map((option) => {return {
                        text: option,
                        isCorrect: correctAnswers.includes(option)
                    }})
                }
            },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error creating question." };
    }
}
