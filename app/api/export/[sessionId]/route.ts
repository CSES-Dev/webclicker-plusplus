import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
const { parse } = require("json2csv");

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = parseInt(params.sessionId);
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "basic";

  const responses = await prisma.response.findMany({
    where: { question: { sessionId } },
    include: {
      user: true,
      question: true,
      option: true,
    },
  });

  const session = await prisma.courseSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return new NextResponse("Session not found", { status: 404 });
  }

  const sessionDate = session.startTime.toISOString().split("T")[0];

  const basicMap = new Map<string, number>();
  const advancedRows = [];

  for (const res of responses) {
    const email = res.user.email ?? "[unknown]";
    basicMap.set(email, (basicMap.get(email) || 0) + 1);

    advancedRows.push({
      email,
      question: res.question.text,
      answer: res.option.text,
      is_correct: res.option.isCorrect,
      date_of_session: sessionDate,
    });
  }

  const basicRows = Array.from(basicMap.entries()).map(([email, count]) => ({
    email,
    num_questions_answered: count,
    date_of_session: sessionDate,
  }));

  const csv = parse(mode === "advanced" ? advancedRows : basicRows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${mode}_export.csv`,
    },
  });
}
