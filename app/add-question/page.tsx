"use client";

import React, { useState } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { questionTypes } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function page() {
    const [selectedQuestionType, setSelectedQuestionType] = useState<String>();
    const [date, setDate] = useState<Date>();
    const [correctAnswers, setCorrectAnswers] = useState<String[]>([""]);
    const [answerChoices, setAnswerChoices] = useState<String[]>([""]);

    return (
        <Drawer>
            <DrawerTrigger className="py-3 px-10 m-3 bg-[hsl(var(--primary))] text-white rounded-lg">
                Add Question
            </DrawerTrigger>
            <DrawerContent className="h-full top-0 right-0 left-auto w-[70%] mt-0 bottom-auto fixed rounded-none">
                <ScrollArea className="h-full flex flex-col">
                    <DrawerHeader className="pt-10 px-16">
                        <DrawerTitle className="text-3xl mb-5 font-normal">
                            Add a Question:
                        </DrawerTitle>
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label>Name of Question:</label>
                                    <input
                                        type="text"
                                        className="h-11 w-80 px-5 bg-[#F2F5FF] text-black border border-slate-300 rounded-lg focus:outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label>Question Type:</label>
                                    <div className="flex flex-row gap-3">
                                        {questionTypes.map((questionType) => (
                                            <button
                                                key={questionType}
                                                onClick={() => {
                                                    setSelectedQuestionType(questionType);
                                                    if (questionType != "Select All")
                                                        setCorrectAnswers([correctAnswers[0]]);
                                                }}
                                                className={`h-11 w-40 border border-slate-300 rounded-lg ${selectedQuestionType == questionType ? "bg-[hsl(var(--primary))] text-white" : "bg-[#F2F5FF] text-black"}`}
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
                                            <p className="ml-3">{date && format(date, "PPP")}</p>
                                            <CalendarIcon className="mx-3 h-4 w-4 float-end" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label>Correct Answer:</label>
                                    {correctAnswers.map((value, index) => (
                                        <div
                                            key={index}
                                            className="h-11 w-80 bg-[#F2F5FF] border border-slate-300 rounded-lg"
                                        >
                                            <input
                                                type="text"
                                                className="w-72 h-full px-5 bg-[#F2F5FF] text-black rounded-lg focus:outline-none"
                                            />
                                            {index > 0 && (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        setCorrectAnswers(
                                                            correctAnswers.filter(
                                                                (ans, i) => index != i,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    x
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {selectedQuestionType == "Select All" && (
                                        <button
                                            onClick={() =>
                                                setCorrectAnswers([...correctAnswers, ""])
                                            }
                                            className="h-9 w-36 mt-2 bg-black text-white border border-slate-300 rounded-lg"
                                        >
                                            Add Answer +
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label>Answer Choices:</label>
                                    {answerChoices.map((value, index) => (
                                        <div
                                            key={index}
                                            className="h-11 w-80 bg-[#F2F5FF] border border-slate-300 rounded-lg"
                                        >
                                            <input
                                                type="text"
                                                className="w-72 h-full px-5 bg-[#F2F5FF] text-black rounded-lg focus:outline-none"
                                            />
                                            {index > 0 && (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        setAnswerChoices(
                                                            answerChoices.filter(
                                                                (ans, i) => index != i,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    x
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setAnswerChoices([...answerChoices, ""])}
                                        className="h-9 w-36 mt-2 bg-black text-white border border-slate-300 rounded-lg"
                                    >
                                        Add Option +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DrawerHeader>
                    <DrawerFooter className="flex items-end px-16">
                        <DrawerClose className="w-40 h-12 bg-[hsl(var(--primary))] text-white rounded-lg">
                            Save Question
                        </DrawerClose>
                    </DrawerFooter>
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    );
}
