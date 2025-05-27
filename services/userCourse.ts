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
    try{
        const studentsData = await prisma.user.findMany({
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
                responses:
                {
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
        const sessions = await prisma.courseSession.findMany({
            where: {
                courseId
            },
            select: {
                id: true,
            },
        }).then((res) => res.map((session) => session.id));

        const result = studentsData.map((student) => {
            const totalSessions = sessions.length;
            const studentResponses = student.responses.filter((response) => sessions.includes(response.question.sessionId));
            const attendedSessions = new Set(
                studentResponses.map((response) => response.question.sessionId)
            ).size;

            const correctResponses = studentResponses.filter(
                (response) => response.question.options.some((option) => option.isCorrect)
            ).length;

            const attendance = totalSessions > 0 ? Math.trunc((attendedSessions / totalSessions) * 100) : 0;
            const pollScore = studentResponses.length > 0 ? Math.trunc((correctResponses / studentResponses.length) * 100) : 0;

            return {
                name: String(student.firstName) + ' ' + String(student.lastName),
                email: student.email,
                attendance,
                pollScore
            };
        });
    return result;
    

    } catch (err){
        console.error(err);
        return { error: "Error fetching students." };
    }
}

export async function getAttendanceByDay(courseId: number, date: Date) {
    try{
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sessions = await prisma.courseSession.findMany({
            where: {
                courseId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: {
                id: true,
            },
        }).then((res) => res.map((session) => session.id));

        const totalStudents = await prisma.user.count(
            {
                where: {
                    courses: {
                        some: {
                            courseId,
                            role: "STUDENT",
                        },
                    },
                },
            }
        )

        if (sessions.length === 0 || totalStudents === 0) {
            return 0;
        }

        const attendedStudents = await prisma.response.findMany({
            where: {
                question: {
                    sessionId: {
                        in: sessions,
                    },
                },
                user: {
                    courses: {
                        some: {
                            courseId,
                            role: 'STUDENT',
                        },
                    },
                },
            },
            distinct: ['userId'],
            select: {
                userId: true,
            },
        });
        
        return Math.trunc((attendedStudents.length / totalStudents) * 100);
    } catch (err){
        console.error(err);
        return { error: "Error calculating attendance rate." };
    }
}
        
