"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    correctAnswers: z.array(z.string().min(1)).min(1, "Input at least one correct answer"),
    answerChoices: z.array(z.string().min(1)).min(1, "Input at least one answer choice"),
});

export default function Page() {
    const { register, handleSubmit, watch, getValues, setValue, reset, formState, control } =
        useForm<z.infer<typeof schema>>({
            resolver: zodResolver(schema),
            defaultValues: {
                correctAnswers: [""],
                answerChoices: [""],
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
            .then(() => createQuestion())
            .catch((err: unknown) => {
                console.error(err);
                return toast({
                    variant: "destructive",
                    description: "Unknown error occurred",
                });
            });
    };

    return (
        <Sheet
            onOpenChange={() => {
                reset();
            }}
        >
            <SheetTrigger className="py-3 px-10 m-3 bg-[hsl(var(--primary))] text-white rounded-lg">
                Add Question
            </SheetTrigger>
            <SheetContent className="h-full top-0 right-0 left-auto w-[90%] md:w-[70%] mt-0 bottom-auto fixed rounded-none">
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
                                        className="h-11 w-64 md:w-80 px-5 bg-[#F2F5FF] text-black border border-slate-300 rounded-lg focus:outline-none"
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
                                                className={`h-11 w-32 md:w-40 border border-slate-300 rounded-lg ${currentQuestionType === questionType ? "bg-[hsl(var(--primary))] text-white" : "bg-[#F2F5FF] text-black"}`}
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
                                    <Popover>
                                        <PopoverTrigger className="h-11 w-64 md:w-80 bg-[#F2F5FF] hover:bg-[#F2F5FF] text-black border border-slate-300 flex justify-between items-center font-normal shadow-none rounded-lg">
                                            <p className="ml-3">
                                                {currentDate && format(currentDate, "PPP")}
                                            </p>
                                            <CalendarIcon className="mx-3 h-4 w-4 float-end" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={currentDate}
                                                onSelect={(date) => {
                                                    if (date) setValue("date", date);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex flex-col gap-2 items-start">
                                    <label>Correct Answer:</label>
                                    {fieldsCorrectAnswers.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="flex flex-row justify-center items-center gap-2"
                                        >
                                            <textarea
                                                className={`h-11 w-64 md:w-80 px-5 bg-[#F2F5FF] text-black border border-slate-300 rounded-lg focus:outline-none pt-3 resize-none ${index === 0 ? "mr-4" : "mr-0"}`}
                                                {...register(`correctAnswers.${index}`)}
                                            />
                                            {index > 0 && (
                                                <button
                                                    key={field.id}
                                                    onClick={() => {
                                                        removeCorrectAnswer(index);
                                                    }}
                                                >
                                                    x
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {currentQuestionType === "Select All" && (
                                        <button
                                            onClick={() => {
                                                appendCorrectAnswer(" ");
                                            }}
                                            className="h-9 w-36 mt-2 bg-black text-white border border-slate-300 rounded-lg"
                                        >
                                            Add Answer +
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 items-start">
                                    <label>Answer Choices:</label>
                                    {fieldsAnswerChoices.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="flex flex-row justify-center items-center gap-2"
                                        >
                                            <textarea
                                                className={`h-11 w-64 md:w-80 px-5 bg-[#F2F5FF] text-black border border-slate-300 rounded-lg focus:outline-none pt-3 resize-none ${index === 0 ? "mr-4" : "mr-0"}`}
                                                {...register(`answerChoices.${index}`)}
                                            />
                                            {index > 0 && (
                                                <button
                                                    key={field.id}
                                                    onClick={() => {
                                                        removeAnswerChoice(index);
                                                    }}
                                                >
                                                    x
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => {
                                            appendAnswerChoice(" ");
                                        }}
                                        className="h-9 w-36 mt-2 bg-black text-white border border-slate-300 rounded-lg"
                                    >
                                        Add Option +
                                    </button>
                                </div>
                                <div className="flex justify-end items-end pr-5">
                                    <SheetClose
                                        onClick={() =>
                                            void handleSubmit(submit, (err) => {
                                                console.error(err);
                                            })()
                                        }
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
