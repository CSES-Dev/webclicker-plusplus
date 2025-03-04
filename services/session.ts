import prisma from "@/lib/prisma";

export async function getSessionById(sessionId: number) {
  return prisma.courseSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        include: {
          options: true,
          responses: true,
        },
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

export async function createWildcardQuestion(sessionId: number) {
  return prisma.question.create({
    data: {
      sessionId,
      text: "Refer to the board",
      type: "MCQ",
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
