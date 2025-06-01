import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
const { parse } = require("json2csv");

export async function GET(req: Request, context: { params: { sessionId: string } }) {
    const sessionId = parseInt(context.params.sessionId);
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

    const userQuestionMap = new Map<string, Set<number>>();
    const advancedRows = [];

    for (const res of responses) {
        const email = res.user.email ?? "[unknown]";
        const questionId = res.question.id;

        if (!userQuestionMap.has(email)) {
            userQuestionMap.set(email, new Set());
        }

        userQuestionMap.get(email)!.add(questionId);

        advancedRows.push({
            email,
            question: res.question.text,
            answer: res.option.text,
            is_correct: res.option.isCorrect,
            date_of_session: sessionDate,
        });
    }

    const basicRows = Array.from(userQuestionMap.entries()).map(([email, questionSet]) => ({
        email,
        num_questions_answered: questionSet.size,
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
