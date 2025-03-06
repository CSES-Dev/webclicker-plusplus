import { QuestionType } from "@prisma/client";

export interface CourseSessionData {
    id: number;
    activeQuestionId: number | null;
}

export interface StartSessionProps {
    courseId: number;
}

export interface ActiveQuestionPayload {
    activeQuestionId: number;
}

export interface WildcardPayload {
    position: number;
    questionType: QuestionType;
}
export interface QuestionData {
    options: { id: number; text: string }[];
    responses: { optionId: number }[];
}
