"use server";
import { Question } from "@prisma/client";
import { findCourseSession } from "./courseSession";
import prisma from "@/lib/prisma";

type FindQuestionsByCourseSessionResult = (Question & { options: { id: number; text: string; isCorrect: boolean }[] })[] | { error: string } | null;

export async function findQuestionsByCourseSession(
    courseId: number,
    start: Date,
): Promise<FindQuestionsByCourseSessionResult> {
    try {
        let questions: (Question & { options: { id: number; text: string; isCorrect: boolean }[] })[] = [];
        await findCourseSession(courseId, start).then(async (res) => {
            if (res && !("error" in res)) {
                const sessionId = res.id;
                questions = await prisma.question.findMany({
                    where: { sessionId },
                    include: {
                        options: true,
                    },
                });
            }
        });
        return questions;
    } catch (err) {
        console.error(err);
        return { error: "Error finding course session." };
    }
}