import { Question, QuestionType } from "@prisma/client";

export async function addWildcardQuestion(
    sessionId: number,
    position: number,
    selectedType: QuestionType,
) {
    const res = await fetch(`/api/session/${sessionId}/wildcard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, questionType: selectedType }),
    });
    if (!res.ok) {
        throw new Error("Failed to add question");
    }
    const newQuestion = (await res.json()) as Question;

    return newQuestion;
}
