import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RequestBody {
    questionId: number;
    optionIds: number[];
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = (await request.json()) as RequestBody;
        const { questionId, optionIds } = body;

        if (!questionId || !optionIds?.length) {
            return NextResponse.json(
                { error: "Question ID and at least one option ID are required" },
                { status: 400 },
            );
        }
        const userId = session.user.id;
        // const responses = [];
        await prisma.response.deleteMany({
            where: {
                userId,
                questionId,
            },
        });

        // Create all responses in a single operation instead of in a loop
        const responses = await prisma.response.createMany({
            data: optionIds.map((optionId) => ({
                userId,
                questionId,
                optionId,
            })),
            skipDuplicates: true,
        });

        return NextResponse.json(
            {
                success: true,
                responses,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error saving response:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
