import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId);

    const pastQuestions = await prisma.question.findMany({
      where: {
        session: {
          courseId: courseId,
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
    return NextResponse.json(
      { error: "Failed to fetch past questions" },
      { status: 500 }
    );
  }
}
