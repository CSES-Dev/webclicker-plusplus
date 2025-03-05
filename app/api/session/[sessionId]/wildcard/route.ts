import { QuestionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { createWildcardQuestion } from "@/services/session";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const { position } = await request.json();
        const resolvedParams = await params;
        const sessionId = parseInt(resolvedParams.sessionId, 10);
        const wildcardQuestion = await createWildcardQuestion(
            sessionId,
            position,
            QuestionType.MCQ,
        );
        return NextResponse.json(wildcardQuestion);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create wildcard question" }, { status: 500 });
    }
}
