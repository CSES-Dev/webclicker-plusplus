import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
    try {
        const sessionId = parseInt(params.sessionId, 10);
        const session = await prisma.courseSession.findUnique({
            where: { id: sessionId },
            include: {
                questions: {
                    include: { options: true },
                    orderBy: { position: "asc" },
                },
            },
        });
        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }
        return NextResponse.json(session);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}
