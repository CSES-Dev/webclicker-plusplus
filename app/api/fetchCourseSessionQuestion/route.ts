// app/api/fetchCourseSessionQuestion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // Authenticate the request
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the sessionId from the request
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId || isNaN(Number(sessionId))) {
            return NextResponse.json(
                { error: "Invalid or missing sessionId parameter" },
                { status: 400 },
            );
        }

        // Fetch the course session to get the activeQuestionId
        const courseSession = await prisma.courseSession.findUnique({
            where: {
                id: parseInt(sessionId),
            },
            select: {
                activeQuestionId: true,
                id: true,
                // Include question count for progress calculation
                _count: {
                    select: {
                        questions: true,
                    },
                },
            },
        });

        if (!courseSession) {
            return NextResponse.json({ error: "Course session not found" }, { status: 404 });
        }

        // Return the active question ID and total question count
        return NextResponse.json({
            activeQuestionId: courseSession.activeQuestionId,
            totalQuestions: courseSession._count.questions,
        });
    } catch (error) {
        console.error("Error fetching course session question:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching course session question" },
            { status: 500 },
        );
    }
}
