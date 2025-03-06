// app/api/fetchQuestionById/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Make sure we're using the correct export format for Next.js App Router
export async function GET(request: NextRequest) {
    try {
        // Authenticate the request
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the questionId from the request
        const { searchParams } = new URL(request.url);
        const questionId = searchParams.get("questionId");

        if (!questionId || isNaN(Number(questionId))) {
            return NextResponse.json(
                { error: "Invalid or missing questionId parameter" },
                { status: 400 },
            );
        }

        // Fetch the question with its options
        const question = await prisma.question.findUnique({
            where: {
                id: parseInt(questionId),
            },
            include: {
                options: true,
            },
        });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Return the question data
        return NextResponse.json(question);
    } catch (error) {
        console.error("Error fetching question:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching the question" },
            { status: 500 },
        );
    }
}
