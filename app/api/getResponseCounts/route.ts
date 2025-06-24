import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validateUser } from "@/services/userCourse";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        // Authenticate the request
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const questionId = searchParams.get("questionId");
        if (!questionId || isNaN(Number(questionId))) {
            return NextResponse.json(
                { error: "Invalid or missing questionId parameter" },
                { status: 400 },
            );
        }

        const courseId = await prisma.course.findFirst({
            where: {
                sessions: {
                    some: {
                        questions: {
                            some: {
                                id: +questionId,
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
            },
        });

        if (!courseId || !(await validateUser(session.user.id, courseId.id, Role.LECTURER))) {
            return NextResponse.json({ error: "Responses not found" }, { status: 404 });
        }

        const groups = await prisma.response.groupBy({
            by: ["optionId"],
            where: { questionId: Number(questionId) },
            _count: { optionId: true },
        });
        const optionCounts = groups.reduce<Record<number, number>>((acc, g) => {
            acc[g.optionId] = g._count.optionId;
            return acc;
        }, {});
        const total = Object.values(optionCounts).reduce((sum, c) => sum + c, 0);
        return NextResponse.json({ optionCounts, responseCount: total });
    } catch (error) {
        console.error("Error fetching response counts:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching response counts" },
            { status: 500 },
        );
    }
}
