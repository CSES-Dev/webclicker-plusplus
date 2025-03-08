"use server";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function addUserToCourse(courseId: number, userId: string, role: Role = "STUDENT") {
    const existingUser = await prisma.userCourse.findFirst({
        where: {
            userId,
            courseId,
        },
    });
    if (!existingUser) {
        await prisma.userCourse.create({
            data: {
                userId,
                courseId,
                role,
            },
        });
    } else {
        return { error: "User is already enrolled in this course" };
    }
}

export async function getUserCourses(userId: string) {
    const courses = await prisma.userCourse.findMany({
        where: {
            user: {
                id: userId,
            },
        },
        include: {
            course: {
                include: {
                    schedules: true,
                },
            },
        },
    });

    // const courses = await Promise.all(
    // userCourses.map(async (course) => await getCourseWithId(course.courseId)),
    // );
    return courses.map(({ course, role }) => ({
        ...course,
        role,
    }));
}

export async function validateUser(userId: string, courseId: number, role: Role): Promise<boolean> {
    const userCourse = await prisma.userCourse.findFirst({
        where: {
            userId,
            courseId,
            role,
        },
    });
    if (userCourse) {
        return true;
    }
    return false;
}
