import { NextResponse } from "next/server";
import { WildcardPayload } from "@/models/CourseSession";
import { createWildcardQuestion } from "@/services/session";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const resolvedParams = await params;
        const { position, questionType } = (await request.json()) as WildcardPayload;
        const sessionId = parseInt(resolvedParams.sessionId, 10);
        const wildcardQuestion = await createWildcardQuestion(sessionId, position, questionType);
        return NextResponse.json(wildcardQuestion);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create wildcard question" }, { status: 500 });
    }
}
