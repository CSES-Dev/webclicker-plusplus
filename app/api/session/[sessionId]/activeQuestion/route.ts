import { NextResponse } from "next/server";
import { ActiveQuestionPayload } from "@/models/CourseSession";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateUser } from "@/services/userCourse";
import { Role } from "@prisma/client";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;

        const courseSession = await prisma.courseSession.findFirst({
            where: {
                id: +sessionId,
            },
            select: {
                courseId: true,
            },
        });

        if (
            !courseSession?.courseId ||
            !(await validateUser(session.user.id, courseSession.courseId, Role.LECTURER))
        ) {
            return NextResponse.json({ error: "Responses not found" }, { status: 404 });
        }

        const { activeQuestionId } = (await request.json()) as ActiveQuestionPayload;
        const updatedSession = await prisma.courseSession.update({
            where: { id: +sessionId },
            data: { activeQuestionId },
        });
        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update active question" }, { status: 500 });
    }
}
