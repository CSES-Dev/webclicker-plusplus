"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { DatePicker } from "@/components/ui/DatePicker";
import { AddInput, ListInput } from "@/components/ui/ListInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { questionTypes } from "@/lib/constants";
import { createCourseSession, findCourseSession } from "@/services/courseSession";
import { addOption, addQuestion } from "@/services/question";

const schema = z.object({
    question: z.string().min(1),
    selectedQuestionType: z.enum(questionTypes),
    date: z.date(),
    correctAnswers: z
        .array(
            z
                .string()
                .min(1)
                .refine((val) => val.trim() !== "", {
                    message: "Answer must not only have spaces",
                }),
        )
        .min(1, "Input at least one correct answer"),
    answerChoices: z
        .array(
            z
                .string()
                .min(1)
                .refine((val) => val.trim() !== "", {
                    message: "Option must not only have spaces",
                }),
        )
        .min(1, "Input at least one answer choice"),
});

export default function Page() {
    const { register, handleSubmit, watch, getValues, setValue, reset, formState, control } =
        useForm<z.infer<typeof schema>>({
            mode: "onChange",
            resolver: zodResolver(schema),
            defaultValues: {
                question: "",
                correctAnswers: [" "],
                answerChoices: [" "],
            },
        });
    const {
        fields: fieldsCorrectAnswers,
        append: appendCorrectAnswer,
        remove: removeCorrectAnswer,
    } = useFieldArray<any>({
        control,
        name: "correctAnswers",
    });
    const {
        fields: fieldsAnswerChoices,
        append: appendAnswerChoice,
        remove: removeAnswerChoice,
    } = useFieldArray<any>({
        control,
        name: "answerChoices",
    });

    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState<boolean>();

    const currentQuestionType = watch("selectedQuestionType");
    const currentDate = watch("date");

    const submit = (values: z.infer<typeof schema>) => {
        const { question, selectedQuestionType, date, correctAnswers, answerChoices } = values;
        const courseId = 19; //get courseId based on course page
        let courseSessionId: number;
        let questionId: number;
        async function getCourseSessionInfo() {
            await findCourseSession(courseId, date)
                .then((res) => {
                    if (res && "error" in res)
                        return toast({ variant: "destructive", description: res?.error ?? "" });
                    else if (res) courseSessionId = res.id;
                })
                .catch((err: unknown) => {
                    console.error(err);
                    return toast({ variant: "destructive", description: "Unknown error occurred" });
                });
            if (!courseSessionId) {
                await createCourseSession(courseId, date)
                    .then((res) => {
                        if ("error" in res)
                            return toast({ variant: "destructive", description: res?.error ?? "" });
                        else if (res) courseSessionId = res.id;
                    })
                    .catch((err: unknown) => {
                        console.error(err);
                        return toast({
                            variant: "destructive",
                            description: "Unknown error occurred",
                        });
                    });
            }
        }
        async function createQuestion() {
            if (!courseSessionId)
                return toast({
                    variant: "destructive",
                    description: "Could not add question to session",
                });
            await addQuestion(courseSessionId, question, selectedQuestionType)
                .then((res) => {
                    if ("error" in res)
                        return toast({ variant: "destructive", description: res?.error ?? "" });
                    else questionId = res.id;
                })
                .catch((err: unknown) => {
                    console.error(err);
                    return toast({ variant: "destructive", description: "Unknown error occurred" });
                });
            if (questionId)
                await Promise.all(
                    answerChoices.map(async (option) => {
                        try {
                            return await addOption(
                                questionId,
                                option,
                                correctAnswers.includes(option),
                            );
                        } catch (err) {
                            console.error(err);
                            return toast({
                                variant: "destructive",
                                description: "Unknown error occurred",
                            });
                        }
                    }),
                );
        }
        getCourseSessionInfo()
            .then(() =>
                createQuestion().then(() => {
                    reset();
                    return toast({
                        description: "Question added successfully",
                    });
                }),
            )
            .catch((err: unknown) => {
                console.error(err);
                return toast({
                    variant: "destructive",
                    description: "Unknown error occurred",
                });
            });
    };

    return (
        <Sheet open={isOpen}>
            <SheetTrigger
                onClick={() => {
                    setIsOpen(true);
                }}
                className="py-3 px-10 m-3 bg-[hsl(var(--primary))] text-white rounded-lg"
            >
                Add Question
            </SheetTrigger>
            <SheetContent className="h-full top-0 right-0 left-auto w-[90%] md:w-[70%] mt-0 bottom-auto fixed rounded-none">
                <SheetClose
                    onClick={() => {
                        reset();
                        setIsOpen(false);
                    }}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </SheetClose>
                <ScrollArea className="h-full flex flex-col">
                    <SheetHeader className="pt-10 px-3 md:px-16">
                        <SheetTitle className="text-3xl mb-5 font-normal">
                            Add a Question:
                        </SheetTitle>
                        <div className="flex flex-row flex-wrap justify-between gap-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2 items-start">
                                    <label>Name of Question:</label>
                                    <input
                                        type="text"
                                        className="h-11 w-64 md:w-80 px-5 bg-[hsl(var(--secondary))] text-black border border-slate-300 rounded-lg focus:outline-none"
                                        {...register("question")}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 items-start">
                                    <label>Question Type:</label>
                                    <div className="flex flex-row gap-3">
                                        {questionTypes.map((questionType) => (
                                            <button
                                                key={questionType}
                                                onClick={() => {
                                                    setValue("selectedQuestionType", questionType);
                                                    if (questionType !== "Select All")
                                                        setValue("correctAnswers", [
                                                            getValues("correctAnswers")[0],
                                                        ]);
                                                }}
                                                className={`h-11 w-32 md:w-40 border border-slate-300 rounded-lg ${currentQuestionType === questionType ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--secondary))] text-black"}`}
                                            >
                                                {questionType}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2 items-start">
                                    <label>Assign Date:</label>
                                    <DatePicker
                                        currentDate={currentDate}
                                        onSelect={(date: Date) => {
                                            setValue("date", date);
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 items-start">
                                    <label>
                                        {currentQuestionType === "Select All"
                                            ? "Correct Answers:"
                                            : "Correct Answer:"}
                                    </label>
                                    {fieldsCorrectAnswers.map((field, index) => (
                                        <ListInput
                                            key={field.id}
                                            id={field.id}
                                            index={index}
                                            removeItem={removeCorrectAnswer}
                                            {...register(`correctAnswers.${index}`)}
                                        />
                                    ))}
                                    {currentQuestionType === "Select All" && (
                                        <AddInput
                                            onAdd={() => {
                                                appendCorrectAnswer(" ");
                                            }}
                                            text="Add Answer +"
                                        />
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 items-start">
                                    <label>Answer Choices:</label>
                                    {fieldsAnswerChoices.map((field, index) => (
                                        <ListInput
                                            key={field.id}
                                            id={field.id}
                                            index={index}
                                            removeItem={removeAnswerChoice}
                                            {...register(`answerChoices.${index}`)}
                                        />
                                    ))}
                                    <AddInput
                                        onAdd={() => {
                                            appendAnswerChoice(" ");
                                        }}
                                        text="Add Option +"
                                    />
                                </div>
                                <div className="flex justify-end items-end pr-5">
                                    <SheetClose
                                        onClick={() => {
                                            void handleSubmit(submit, (err) => {
                                                console.error(err);
                                            })();
                                            setIsOpen(false);
                                        }}
                                        disabled={!formState.isValid}
                                        className="w-40 h-12 bg-[hsl(var(--primary))] disabled:bg-slate-400 text-white rounded-lg"
                                    >
                                        Save Question
                                    </SheetClose>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                    <SheetFooter className="flex items-end px-16"></SheetFooter>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
