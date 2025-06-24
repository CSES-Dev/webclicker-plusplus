import { NextResponse } from "next/server";
import { WildcardPayload } from "@/models/CourseSession";
import { createWildcardQuestion } from "@/services/session";
import { validateUser } from "@/services/userCourse";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const resolvedParams = await params;
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
        const { position, questionType } = (await request.json()) as WildcardPayload;
        const wildcardQuestion = await createWildcardQuestion(+sessionId, position, questionType);
        return NextResponse.json(wildcardQuestion);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create wildcard question" }, { status: 500 });
    }
}
