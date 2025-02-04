"use server";
import { getCourseWithId } from "./course";
import prisma from "@/lib/prisma";

export async function addUserToCourse(courseId: number, userId: number ){
    const existingUser = await prisma.userCourse.findFirst({
        where: {
            userId,
            courseId,
        }
    })
    if (!existingUser){
        await prisma.userCourse.create({
            data: {
                userId,
                courseId,
            }
        })
    }
    else{
        return {error: "User is already enrolled in this course"}
    }
}

export async function getUserCourses(userId: number){
    const userCourses = await prisma.userCourse.findMany({
        where: {
            userId
        }
    })
    const courses = await Promise.all(userCourses.map(async (course) => await getCourseWithId(course.courseId)));
    return courses;
}