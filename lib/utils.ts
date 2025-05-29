import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { QuestionWithResponesAndOptions, Response, Student } from "./constants";
import { getAttendanceCount, getStudentCount } from "@/services/userCourse";
/**
 * A utility function that merges tailwind classes with conditional classes combining functionalities of twMerge and clsx.
 *
 * @param inputs - Array of classnames/conditional classes.
 * @returns Merged className string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * A utility function that generates a greeting message.
 *
 * @param name - The name to greet.
 * @returns A greeting message.
 */
export function greetUser(name: string): string {
    return `Hello, ${name}! Welcome to our site.`;
}

/**
 * A utility function that replaces date objects time to 00:00:00 and returns ISO String.
 *
 * @param date - The name to greet.
 * @returns A greeting message.
 */
export function formatDateToISO(date: Date) {
    return new Date(date.setHours(0, 0, 0, 0)).toISOString();
}

export function shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function getQuestionsWithAverageScore(questions: QuestionWithResponesAndOptions[]) {
    const questionsWithScores = [];

    for (const question of questions) {
        // get the IDs of the correct options
        const correctOptionIds = question.options
            .filter((option) => option.isCorrect)
            .map((option) => option.id);

        // check if at least one option is correct
        let correctCount = 0;
        question.responses.forEach((response) => {
            if (correctOptionIds.includes(response.optionId)) {
                correctCount++;
            }
        });

        // add question and score information to result
        questionsWithScores.push({
            type: question.type,
            title: question.text,
            average:
                question.responses.length === 0
                    ? 0
                    : Math.trunc((correctCount / question.responses.length) * 100),
        });
    }

    return questionsWithScores;
}

export function getIncorrectAndCorrectResponseCounts(responses: Response[]) {
    let correctResponses = 0;
    let incorrectReponses = 0;

    for (const question of responses) {
        // get the IDs of the correct options
        const correctOptionIds = question.options
            .filter((option) => option.isCorrect)
            .map((option) => option.id);

        // increment correctResponses if the option is correct, else increment incorrect responses
        question.responses.forEach((response) => {
            if (correctOptionIds.includes(response.optionId)) {
                correctResponses++;
            } else {
                incorrectReponses++;
            }
        });
    }

    return { incorrect: incorrectReponses, correct: correctResponses };
}

export function getStudentsWithScores(students: Student[], sessionIds: number[]) {
    const studentData = students.map((student) => {
        // get total number of sessions
        const totalSessions = sessionIds.length;

        // get all student responses for this course
        const studentResponses = student.responses.filter((response) =>
            sessionIds.includes(response.question.sessionId),
        );

        // get number of sessions attended
        const attendedSessions = new Set(
            studentResponses.map((response) => response.question.sessionId),
        ).size;

        // get number of correct responses
        const correctResponses = studentResponses.filter((response) =>
            response.question.options.some((option) => option.isCorrect),
        ).length;

        // calculate attendance and poll score
        const attendance =
            totalSessions > 0 ? Math.trunc((attendedSessions / totalSessions) * 100) : 0;

        const pollScore =
            studentResponses.length > 0
                ? Math.trunc((correctResponses / studentResponses.length) * 100)
                : 0;

        return {
            name: String(student.firstName) + " " + String(student.lastName),
            email: student.email,
            attendance,
            pollScore,
        };
    });

    return studentData;
}

export function calculateDayAttendance(attendanceCount: number, totalStudentsCount: number) {
    if (totalStudentsCount === 0) {
        return 0;
    }
    return Math.trunc((attendanceCount / totalStudentsCount) * 100);
}

export async function calculateWeekAttendance(start: Date, courseId: number) {
    try {
        const promises = Array.from({ length: 7 }).map(async (_, i) => {
            const day = dayjs(start).add(i, "day");
            try {
                const studentCount = await getStudentCount(courseId);
                if (typeof studentCount !== "number") {
                    throw Error();
                }
                const attendanceCount = await getAttendanceCount(courseId, day.toDate());
                if (typeof attendanceCount !== "number") {
                    throw Error();
                }
                const attendance = calculateDayAttendance(attendanceCount, studentCount);
                return { date: day.format("M/D"), attendance };
            } catch (err) {
                console.error(err);
                throw Error();
            }
        });

        const weekData = await Promise.all(promises);
        return weekData;
    } catch (err: unknown) {
        console.error(err);
        return { error: "Error calculating attendance" };
    }
}
