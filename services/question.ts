"use server";
import { QuestionType } from "@prisma/client";
import { questionTypes } from "@/lib/constants";
import prisma from "@/lib/prisma";

export async function addQuestion(
    sessionId: number,
    text: string,
    type: (typeof questionTypes)[number],
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
            },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error creating course session." };
    }
}

export async function addOption(questionId: number, text: string, isCorrect: boolean) {
    try {
        return await prisma.option.create({
            data: {
                questionId,
                text,
                isCorrect,
            },
        });
    } catch (err) {
        console.error(err);
        return { error: "Error creating course session." };
    }
}
