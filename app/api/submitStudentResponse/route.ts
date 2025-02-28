import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request){
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const { questionId, optionIds } = body;
        
        if (!questionId || !optionIds || !optionIds.length){
            return NextResponse.json(
                { error: "Question ID and at least one option ID are required" }, 
                { status: 400 }
            );
        }
        const userId = session.user.id;
        const responses = [];
        await prisma.response.deleteMany({
            where: {
                userId,
                questionId
            }
        });
        for (const optionId of optionIds) {
        const response = await prisma.response.create({
            data: {
                userId,
                questionId,
                optionId,
            }
        });
        responses.push(response);
        }

        return NextResponse.json({
            success: true,
            responses
        }, { status: 201 })
    } catch (error){
        console.error("Error saving response:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}