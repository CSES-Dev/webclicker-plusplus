"use server";
import { Role } from "@prisma/client";
import { getSessionIdsByDate } from "./session";
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

    return courses.map(({ course, role }) => ({
        ...course,
        role,
    }));
}

export async function validateUser(
    userId: string,
    courseId: number,
    role?: Role,
): Promise<boolean> {
    const userCourse = await prisma.userCourse.findFirst({
        where: {
            userId,
            courseId,
            role: undefined,
        },
    });
    if (userCourse) {
        return true;
    }
    return false;
}

export async function getInstructorsForCourse(courseId: number) {
    return await prisma.userCourse.findMany({
        where: { courseId, role: "LECTURER" },
        select: {
            user: true,
        },
    });
}

export async function addUserToCourseByEmail(
    courseId: number,
    email: string,
    role: Role = "LECTURER",
) {
    const existingUser = await prisma.userCourse.findFirst({
        where: {
            user: {
                email,
            },
            courseId,
        },
    });
    if (!existingUser) {
        const user = await prisma.user.findFirstOrThrow({ where: { email } });
        await prisma.userCourse.create({
            data: {
                userId: user.id,
                courseId,
                role,
            },
        });
    } else {
        return { error: "User is already enrolled in this course" };
    }
}

export async function getStudents(courseId: number, query: string | undefined) {
    try {
        const students = await prisma.user.findMany({
            where: {
                courses: {
                    some: {
                        courseId,
                        role: "STUDENT",
                    },
                },
                ...(query
                    ? {
                          OR: [
                              {
                                  email: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  firstName: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  lastName: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                          ],
                      }
                    : {}),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                responses: {
                    select: {
                        question: {
                            select: {
                                sessionId: true,
                                options: {
                                    select: {
                                        isCorrect: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return students;
    } catch (err) {
        console.error(err);
        return { error: "Error fetching students." };
    }
}

export async function getStudentCount(courseId: number) {
    try {
        const totalStudents = await prisma.user.count({
            where: {
                courses: {
                    some: {
                        courseId,
                        role: "STUDENT",
                    },
                },
            },
        });

        return totalStudents;
    } catch (err) {
        console.error(err);
        return { error: "Error fetching student information" };
    }
}

export async function getAttendanceCount(courseId: number, date: Date) {
    try {
        const sessionIds = await getSessionIdsByDate(courseId, date);

        if ("error" in sessionIds) {
            throw Error();
        }

        if (sessionIds.length === 0) {
            return 0;
        }

        const attendedStudents = await prisma.response.findMany({
            where: {
                question: {
                    sessionId: {
                        in: sessionIds,
                    },
                },
                user: {
                    courses: {
                        some: {
                            courseId,
                            role: "STUDENT",
                        },
                    },
                },
            },
            distinct: ["userId"],
            select: {
                userId: true,
            },
        });

        return attendedStudents.length;
    } catch (err) {
        console.error(err);
        return { error: "Error fetching student information" };
    }
}
