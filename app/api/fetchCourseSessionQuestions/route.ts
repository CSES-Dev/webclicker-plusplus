import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        // 1. Authenticate the request
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get the sessionId from the URL params
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");
        
        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" }, 
                { status: 400 }
            );
        }

        // 3. Fetch questions with their options for this session
        const questions = await prisma.question.findMany({
            where: {
                sessionId: parseInt(sessionId)
            },
            include: {
                options: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        // 4. Return the questions
        return NextResponse.json(questions, { status: 200 });
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}