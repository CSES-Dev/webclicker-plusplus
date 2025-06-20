import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validateUser } from "@/services/userCourse";

export async function GET(request: NextRequest, context: { params: Promise<{ courseId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { courseId: courseIdStr } = await context.params;

        const courseId = parseInt(courseIdStr);

        if (!courseId || isNaN(Number(courseId))) {
            return NextResponse.json(
                { error: "Invalid or missing sessionId parameter" },
                { status: 400 },
            );
        }

        if (!(await validateUser(session.user.id, courseId, Role.LECTURER))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const pastQuestions = await prisma.question.findMany({
            where: {
                session: {
                    courseId,
                    endTime: { not: null },
                },
            },
            include: {
                session: { select: { startTime: true } },
                options: true,
                responses: {
                    include: {
                        option: true,
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { session: { startTime: "desc" } },
        });

        return NextResponse.json(pastQuestions);
    } catch (error) {
        console.error("Failed to fetch past questions", error);
        return NextResponse.json({ error: "Failed to fetch past questions" }, { status: 500 });
    }
}
