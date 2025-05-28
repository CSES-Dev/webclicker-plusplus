// File: services/analytics.ts
"use server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function getStudentAnalytics(courseId: number, userId: string) {
  // Get user's full name
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  if (!user) throw new Error("User not found");

  const fullName = `${user.firstName} ${user.lastName ?? ""}`.trim();

  // Get all course sessions for this course
  const sessions = await prisma.courseSession.findMany({
    where: { courseId },
    include: {
      questions: {
        include: {
          options: true,
          responses: {
            where: { userId },
          },
        },
      },
    },
  });

  const sessionDates = sessions.map((s) => dayjs(s.startTime).format("YYYY-MM-DD"));
  const allDatesSet = new Set(sessionDates);

  const checkInDatesSet = new Set<string>();
  let mcqTotal = 0, mcqCorrect = 0;
  let msqTotal = 0, msqCorrect = 0;

  for (const session of sessions) {
    let studentAnswered = false;
    for (const question of session.questions) {
      const isMCQ = question.type === "MCQ";
      const isMSQ = question.type === "MSQ";

      const correctOptions = question.options.filter((o) => o.isCorrect);
      const studentResponses = question.responses;

      if (studentResponses.length > 0) {
        studentAnswered = true;
        if (isMCQ) {
          mcqTotal++;
          if (studentResponses[0]?.optionId === correctOptions[0]?.id) {
            mcqCorrect++;
          }
        } else if (isMSQ) {
          msqTotal++;
          const selected = new Set(studentResponses.map((r) => r.optionId));
          const expected = new Set(correctOptions.map((o) => o.id));

          const matched =
            selected.size === expected.size &&
            [...selected].every((id) => expected.has(id));

          if (matched) msqCorrect++;
        }
      }
    }
    if (studentAnswered) {
      checkInDatesSet.add(dayjs(session.startTime).format("MM/DD"));
    }
  }

  const totalSessions = allDatesSet.size;
  const attendedSessions = checkInDatesSet.size;
  const lastCheckIn = [...checkInDatesSet].sort().pop();

  const mcqScore = mcqTotal ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
  const msqScore = msqTotal ? Math.round((msqCorrect / msqTotal) * 100) : 0;
  const averagePollScore = Math.round((mcqScore + msqScore) / 2);

  return {
    fullName,
    attendancePercentage: totalSessions ? Math.round((attendedSessions / totalSessions) * 100) : 0,
    totalCheckIns: attendedSessions,
    lastCheckInDate: lastCheckIn ?? null,
    mcqScore,
    msqScore,
    averagePollScore,
  };
}

export async function getQuestionsAndResponsesForDate(courseId: number, studentId: string, date: Date) {
    try {
      const sessions = await prisma.courseSession.findMany({
        where: {
          courseId,
          startTime: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          questions: {
            include: {
              options: true,
              responses: {
                where: {
                  userId: studentId,
                },
              },
            },
          },
        },
      });
  
      const questions = sessions.flatMap(session => session.questions).map(question => ({
        id: question.id,
        text: question.text,
        type: question.type,
        inputtedAnswers: question.responses.map(r => r.optionId),
        correctAnswers: question.options.filter(opt => opt.isCorrect).map(opt => opt.id),
        options: question.options.map(opt => ({ id: opt.id, text: opt.text })),
      }));
  
      return questions;
    } catch (error) {
      console.error("Failed to get questions and responses:", error);
      return [];
    }
  }