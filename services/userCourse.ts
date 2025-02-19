"use server";
import { Role } from "@prisma/client";
import { getCourseWithId } from "./course";
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
    const courses = await prisma.course.findMany({
        where: {
            users: {
                some: {
                    userId: userId,
                },
            },
        },
        include: {
            schedules: true,
        },
    });
    // const courses = await Promise.all(
    // userCourses.map(async (course) => await getCourseWithId(course.courseId)),
    // );
    return courses;
}
