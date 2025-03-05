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
                orderBy: { position: "asc" },
            },
        },
    });

    return session?.questions ?? [];
}

export async function createWildcardQuestion(
  sessionId: number,
  position: number,
  questionType: QuestionType
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
        position: position,
        options: {
          create: [
            { text: "A", isCorrect: true },
            { text: "B", isCorrect: true },
            { text: "C", isCorrect: true },
            { text: "D", isCorrect: true },
          ],
        },
      },
      include: { options: true },
    });

    return newQuestion;
  });
}
