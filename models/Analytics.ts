import { Option, Question, Response as ResponseSchema } from "@prisma/client";

export type QuestionWithResponesAndOptions = ResponseWithOptions & Question;

export type ResponseWithOptions = {
    options: Option[];
    responses: ResponseSchema[];
};

export type StudentWithResponses = {
    id: string;
    responses: {
        question: {
            sessionId: number;
            options: {
                isCorrect: boolean;
            }[];
        };
    }[];
    email: string | null;
    firstName: string;
    lastName: string | null;
};
