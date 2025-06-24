import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validateUser } from "@/services/userCourse";
import { Role } from "@prisma/client";

const updateSchema = z.object({
    title: z.string().min(2),
    color: z.string().length(7),
    days: z.array(z.string()).min(1),
    startTime: z.string(),
    endTime: z.string(),
});

function getCourseId(request: Request): number {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const courseId = parseInt(id ?? "");

    if (isNaN(courseId)) {
        throw new Error("Invalid course ID");
    }
    return courseId;
}

// PUT - Update Course
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const courseId = getCourseId(request);

        // Verify user has permission
        if (!courseId || !(await validateUser(session.user.id, courseId, Role.LECTURER))) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Validate request body
        const body: unknown = await request.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { title, color, days, startTime, endTime } = parsed.data;

        // Update course and schedule in transaction
        const [updatedCourse] = await prisma.$transaction([
            prisma.course.update({
                where: { id: courseId },
                data: { title, color },
            }),
            prisma.schedule.updateMany({
                where: { courseId },
                data: { dayOfWeek: days, startTime, endTime },
            }),
        ]);

        return NextResponse.json(updatedCourse);
    } catch (error) {
        if (error instanceof Error && error.message === "Invalid course ID") {
            return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
        }

        console.error("Error updating course:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE - Delete Course
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const courseId = getCourseId(request);

        // Verify user has permission
        const userCourse = await prisma.userCourse.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId,
                },
            },
        });

        if (!userCourse) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (userCourse.role === "LECTURER") {
            // Lecturer - delete all related records in proper order
            await prisma.$transaction([
                prisma.response.deleteMany({
                    where: {
                        question: {
                            session: {
                                courseId,
                            },
                        },
                    },
                }),
                prisma.option.deleteMany({
                    where: {
                        question: {
                            session: {
                                courseId,
                            },
                        },
                    },
                }),
                prisma.question.deleteMany({
                    where: {
                        session: {
                            courseId,
                        },
                    },
                }),
                prisma.courseSession.deleteMany({
                    where: { courseId },
                }),
                prisma.schedule.deleteMany({
                    where: { courseId },
                }),
                prisma.userCourse.deleteMany({
                    where: { courseId },
                }),
                prisma.course.delete({
                    where: { id: courseId },
                }),
            ]);
        } else {
            // Student - only remove their association
            await prisma.userCourse.delete({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId,
                    },
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === "Invalid course ID") {
            return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
        }

        console.error("Error deleting course:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
