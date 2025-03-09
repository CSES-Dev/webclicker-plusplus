import { NextResponse } from "next/server";
import { ActiveQuestionPayload } from "../../../../../models/CourseSession";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const resolvedParams = await params;
        const { activeQuestionId } = (await request.json()) as ActiveQuestionPayload;
        const sessionId = parseInt(resolvedParams.sessionId, 10);
        const updatedSession = await prisma.courseSession.update({
            where: { id: sessionId },
            data: { activeQuestionId },
        });
        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update active question" }, { status: 500 });
    }
}
