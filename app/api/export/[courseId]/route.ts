import { Role } from "@prisma/client";
import { parse } from "json2csv";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { csvAdvancedFieldNames, csvBasicFieldNames } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { ExportCSVType } from "@/types/ExportCSVType";

export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await context.params;

    if (!courseId || Number.isNaN(+courseId)) {
        return NextResponse.json({ error: "Course Id is required" }, { status: 403 });
    }

    const courseLecturers = await prisma.userCourse.findMany({
        where: {
            courseId: +courseId,
            role: Role.LECTURER,
        },
        select: {
            userId: true,
        },
    });

    if (!courseLecturers.find((lecturer) => lecturer.userId === session.user.id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const modeParam = url.searchParams.get("mode");
    const mode: ExportCSVType =
        modeParam === null || Number.isNaN(modeParam) ? ExportCSVType.BASIC : +modeParam;

    const responses = await prisma.response.findMany({
        where: { question: { session: { courseId: +courseId } } },
        include: {
            user: true,
            question: {
                include: {
                    session: true,
                },
            },
            option: true,
        },
    });

    console.log(responses);

    const userQuestionMap = new Map<string, Set<number>>();
    const advancedRows = [];

    for (const res of responses) {
        const email = res.user.email ?? "[unknown]";
        const sessionDate = res.question.session.startTime.toDateString();
        const questionId = res.question.id;

        const setKey = email + "--" + sessionDate;

        if (!userQuestionMap.has(setKey)) {
            userQuestionMap.set(setKey, new Set());
        }

        userQuestionMap.get(setKey)?.add(questionId);

        advancedRows.push({
            email,
            question: res.question.text,
            answer: res.option.text,
            is_correct: res.option.isCorrect,
            date_of_session: sessionDate,
        });
    }

    const basicRows = Array.from(userQuestionMap.entries()).map(([setKey, questionSet]) => {
        const [email, sessionDate] = setKey.split("--");
        return {
            email,
            num_questions_answered: questionSet.size,
            date_of_session: sessionDate,
        };
    });

    const csv =
        mode === ExportCSVType.ADVANCED
            ? parse(advancedRows, { fields: csvAdvancedFieldNames })
            : parse(basicRows, { fields: csvBasicFieldNames });

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=sessions_export_${mode === ExportCSVType.ADVANCED ? "advanced" : "basic"}.csv`,
        },
    });
}
