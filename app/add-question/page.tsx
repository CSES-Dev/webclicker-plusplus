"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { questionTypes } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFieldArray, useForm } from "react-hook-form";

type QuestionData = {
    question: string;
    selectedQuestionType: string;
    date: Date;
    correctAnswers: string[];
    answerChoices: string[];
};
export default function page() {
    const { register, handleSubmit, watch, getValues, setValue, control } = useForm<QuestionData>({
        defaultValues: { correctAnswers: [" "], answerChoices: [" "] },
    });
    const {
        fields: fieldsCorrectAnswers,
        append: appendCorrectAnswer,
        remove: removeCorrectAnswer,
    } = useFieldArray<any>({ control, name: "correctAnswers" });
    const {
        fields: fieldsAnswerChoices,
        append: appendAnswerChoice,
        remove: removeAnswerChoice,
    } = useFieldArray<any>({ control, name: "answerChoices" });
    const currentQuestionType = watch("selectedQuestionType");

    return (
        <Sheet>
            <SheetTrigger className="py-3 px-10 m-3 bg-[hsl(var(--primary))] text-white rounded-lg">
                Add Question
            </SheetTrigger>
            <SheetContent className="h-full top-0 right-0 left-auto w-[70%] mt-0 bottom-auto fixed rounded-none">
                <ScrollArea className="h-full flex flex-col">
                    <SheetHeader className="pt-10 px-16">
                        <SheetTitle className="text-3xl mb-5 font-normal">
                            Add a Question:
                        </SheetTitle>
                        <div className="flex flex-row justify-between gap-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label>Name of Question:</label>
                                    <input
                                        type="text"
                                        className="h-11 w-80 px-5 bg-[#F2F5FF] text-black border border-slate-300 rounded-lg focus:outline-none"
                                        {...register("question")}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label>Question Type:</label>
                                    <div className="flex flex-row gap-3">
                                        {questionTypes.map((questionType) => (
                                            <button
                                                key={questionType}
                                                onClick={() => {
                                                    setValue("selectedQuestionType", questionType);
                                                    if (questionType != "Select All")
                                                        setValue("correctAnswers", [
                                                            getValues("correctAnswers")[0],
                                                        ]);
                                                }}
                                                className={`h-11 w-40 border border-slate-300 rounded-lg ${currentQuestionType == questionType ? "bg-[hsl(var(--primary))] text-white" : "bg-[#F2F5FF] text-black"}`}
                                            >
                                                {questionType}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label>Assign Date:</label>
                                    <Popover>
                                        <PopoverTrigger className="h-11 w-80 bg-[#F2F5FF] hover:bg-[#F2F5FF] text-black border border-slate-300 flex justify-between items-center font-normal shadow-none rounded-lg">
                                            <p className="ml-3">
                                                {getValues("date") &&
                                                    format(getValues("date"), "PPP")}
                                            </p>
                                            <CalendarIcon className="mx-3 h-4 w-4 float-end" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={getValues("date")}
                                                {...register("date")}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label>Correct Answer:</label>
                                    {fieldsCorrectAnswers.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="flex flex-row justify-center items-center gap-2"
                                        >
                                            <textarea
                                                className={`h-11 w-80 px-5 bg-[#F2F5FF] text-black border border-slate-300 rounded-lg focus:outline-none pt-3 resize-none ${index == 0 && "mr-4"}`}
                                            />
                                            {index > 0 && (
                                                <button
                                                    key={field.id}
                                                    onClick={() => removeCorrectAnswer(index)}
                                                >
                                                    x
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {currentQuestionType == "Select All" && (
                                        <button
                                            onClick={() => appendCorrectAnswer(" ")}
                                            className="h-9 w-36 mt-2 bg-black text-white border border-slate-300 rounded-lg"
                                        >
                                            Add Answer +
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label>Answer Choices:</label>
                                    {fieldsAnswerChoices.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="flex flex-row justify-center items-center gap-2"
                                        >
                                            <textarea
                                                className={`h-11 w-80 px-5 bg-[#F2F5FF] text-black border border-slate-300 rounded-lg focus:outline-none pt-3 resize-none ${index == 0 && "mr-4"}`}
                                            />
                                            {index > 0 && (
                                                <button
                                                    key={field.id}
                                                    onClick={() => removeAnswerChoice(index)}
                                                >
                                                    x
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => appendAnswerChoice(" ")}
                                        className="h-9 w-36 mt-2 bg-black text-white border border-slate-300 rounded-lg"
                                    >
                                        Add Option +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                    <SheetFooter className="flex items-end px-16">
                        <SheetClose className="w-40 h-12 bg-[hsl(var(--primary))] text-white rounded-lg">
                            Save Question
                        </SheetClose>
                    </SheetFooter>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
