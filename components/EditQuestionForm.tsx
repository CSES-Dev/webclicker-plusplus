"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { DatePicker } from "@/components/ui/DatePicker";
import { AddInput, ListInput } from "@/components/ui/ListInput";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { getOrCreateCourseSession } from "@/services/courseSession";
import { updateQuestion } from "@/services/question";

const schema = z.object({
    question: z.string().min(1, { message: "Question must have at least one character" }),
    selectedQuestionType: z.enum(questionTypes),
    date: z.date(),
    correctAnswers: z
        .array(
            z.object({
                answer: z
                    .string()
                    .min(1, { message: "Correct answers must have at least one character" })
                    .refine((val) => val.trim() !== "", {
                        message: "Answer must not only have spaces",
                    }),
            }),
        )
        .min(1, "Add at least one correct answer"),
    answerChoices: z
        .array(
            z.object({
                choice: z
                    .string()
                    .min(1, { message: "Answer choices must have at least one character" })
                    .refine((val) => val.trim() !== "", {
                        message: "Option must not only have spaces",
                    }),
            }),
        )
        .min(1, "Add at least one answer choice"),
});

interface Props {
    courseId: number;
    prevQuestion: {
        id: number;
        name: string;
        type: "MCQ" | "MSQ";
        date: Date;
        correctAnswers: { answer: string }[];
        answerChoices: { choice: string }[];
    };
}

export const EditQuestionForm: React.FC<Props> = ({ courseId, prevQuestion }: Props) => {
    const form = useForm<z.infer<typeof schema>>({
        mode: "onChange",
        resolver: zodResolver(schema),
    });
    const {
        fields: fieldsCorrectAnswers,
        append: appendCorrectAnswer,
        remove: removeCorrectAnswer,
    } = useFieldArray<z.infer<typeof schema>>({
        control: form.control,
        name: "correctAnswers",
    });
    const {
        fields: fieldsAnswerChoices,
        append: appendAnswerChoice,
        remove: removeAnswerChoice,
    } = useFieldArray<z.infer<typeof schema>>({
        control: form.control,
        name: "answerChoices",
    });

    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        console.log(form.getValues("correctAnswers"));
        console.log(form.getValues("answerChoices"));
    }, [form.getValues("correctAnswers")]);
    useEffect(() => {
        form.setValue("question", prevQuestion.name);
        form.setValue(
            "selectedQuestionType",
            prevQuestion.type === "MCQ" ? "Multiple Choice" : "Select All",
        );
        form.setValue("date", prevQuestion.date);
        form.setValue(
            "answerChoices",
            prevQuestion.answerChoices.filter((choice) => choice.choice !== ""),
        );
        form.setValue(
            "correctAnswers",
            prevQuestion.correctAnswers.filter((choice) => choice.answer !== ""),
        );
    }, [prevQuestion]);

    const currentQuestionType = form.watch("selectedQuestionType");
    useEffect(() => {
        if (currentQuestionType !== "Select All")
            form.setValue("correctAnswers", [form.getValues("correctAnswers")[0]]);
    }, [currentQuestionType]);

    const submit = (values: z.infer<typeof schema>) => {
        if (Object.keys(form.formState.isValid)?.length) return;

        const { question, selectedQuestionType, date, correctAnswers, answerChoices } = values;
        let courseSessionId: number;

        async function getCourseSessionInfo() {
            await getOrCreateCourseSession(courseId, date)
                .then((res) => {
                    if (res && "error" in res)
                        return toast({ variant: "destructive", description: res?.error ?? "" });
                    else if (res) courseSessionId = res?.id;
                })
                .catch((err: unknown) => {
                    console.error(err);
                    return toast({
                        variant: "destructive",
                        description: "Unknown error occurred",
                    });
                });
        }
        async function editQuestion() {
            if (!courseSessionId)
                return toast({
                    variant: "destructive",
                    description: "Could not find course session",
                });
            await updateQuestion(
                prevQuestion.id,
                courseSessionId,
                question,
                selectedQuestionType,
                answerChoices.map((choiceObject) => choiceObject.choice),
                correctAnswers.map((answerObject) => answerObject.answer),
            )
                .then((res) => {
                    if ("error" in res)
                        return toast({ variant: "destructive", description: res?.error ?? "" });
                })
                .catch((err: unknown) => {
                    console.error(err);
                    return toast({ variant: "destructive", description: "Unknown error occurred" });
                });
        }
        setLoading(false);
        getCourseSessionInfo()
            .then(() =>
                editQuestion().then(() => {
                    setIsOpen(false);
                    setLoading(false);
                    form.reset();
                    return toast({
                        description: "Question edited successfully",
                    });
                }),
            )
            .catch((err: unknown) => {
                setLoading(false);
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
                asChild
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                <button className="text-base sm:text-xl font-normal px-5 sm:px-8 py-3 bg-[#F2F5FF] text-[#18328D] rounded-xl border border-[#A5A5A5]">
                    Edit
                </button>
            </SheetTrigger>
            <SheetContent className="h-full top-0 right-0 left-auto sm:w-[90%] md:w-[70%] mt-0 bottom-auto fixed rounded-none">
                <SheetClose
                    onClick={() => {
                        form.reset();
                        setIsOpen(false);
                    }}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </SheetClose>
                <ScrollArea className="h-full flex flex-col">
                    <SheetHeader className="pt-10 px-3 sm:px-8 md:px-16 mx-auto">
                        <SheetTitle className="w-full text-3xl mb-5 font-normal">
                            Edit Question:
                        </SheetTitle>
                        <FormProvider {...form}>
                            <div className="flex flex-col lg:flex-row sm:gap-8 sm:justify-between">
                                <div className="flex flex-col gap-6 w-full lg:w-1/2">
                                    <FormField
                                        control={form.control}
                                        name={"question"}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col gap-1">
                                                <FormLabel className="text-left">
                                                    Name of Question:
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-11 w-full px-5 bg-[hsl(var(--secondary))] text-black border border-slate-300 rounded-lg focus:outline-none"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={"selectedQuestionType"}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col justify-center items-start">
                                                <FormLabel className="text-left">
                                                    Question Type:
                                                </FormLabel>
                                                <div className="flex flex-row flex-wrap gap-2">
                                                    {questionTypes.map((questionType) => (
                                                        <button
                                                            key={questionType}
                                                            onClick={() => {
                                                                field.onChange(questionType);
                                                                if (field.value !== "Select All")
                                                                    form.setValue(
                                                                        "correctAnswers",
                                                                        [
                                                                            form.getValues(
                                                                                "correctAnswers",
                                                                            )[0],
                                                                        ],
                                                                    );
                                                                else return;
                                                            }}
                                                            className={`h-11 w-36 border border-slate-300 rounded-lg ${field.value === questionType ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--secondary))] text-black"}`}
                                                        >
                                                            {questionType}
                                                        </button>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex flex-col gap-6 w-full lg:w-1/2 mt-5 md:mt-0">
                                    <FormField
                                        control={form.control}
                                        name={"date"}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col gap-1 justify-center items-start">
                                                <FormLabel className="text-left">Date:</FormLabel>
                                                <DatePicker
                                                    currentDate={field.value}
                                                    onSelect={(date: Date) => {
                                                        field.onChange(date);
                                                    }}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={"correctAnswers"}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col justify-center items-start">
                                                <FormLabel className="text-left">
                                                    {form.getValues("selectedQuestionType") ===
                                                    "Select All"
                                                        ? "Correct Answers:"
                                                        : "Correct Answer:"}
                                                </FormLabel>
                                                <div className="flex flex-col gap-2 items-start w-full">
                                                    {fieldsCorrectAnswers.map(
                                                        (correctAnswer, index) => {
                                                            return (
                                                                <ListInput
                                                                    key={correctAnswer.id}
                                                                    id={correctAnswer.id}
                                                                    index={index}
                                                                    value={
                                                                        field.value[index]
                                                                            ?.answer || ""
                                                                    }
                                                                    removeItem={removeCorrectAnswer}
                                                                    onChange={(
                                                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                                                    ) => {
                                                                        const newValue = [
                                                                            ...field.value,
                                                                        ];
                                                                        newValue[index].answer =
                                                                            e.target.value;
                                                                        field.onChange(newValue);
                                                                    }}
                                                                />
                                                            );
                                                        },
                                                    )}
                                                    {form.getValues("selectedQuestionType") ===
                                                        "Select All" && (
                                                        <AddInput
                                                            onAdd={() => {
                                                                appendCorrectAnswer({
                                                                    answer: " ",
                                                                });
                                                            }}
                                                            text="Add Answer +"
                                                        />
                                                    )}
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={"answerChoices"}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col justify-center items-start">
                                                <FormLabel className="text-left">
                                                    Other Choices:
                                                </FormLabel>
                                                <div className="flex flex-col gap-2 items-start w-full">
                                                    {fieldsAnswerChoices.map(
                                                        (answerChoice, index) => {
                                                            return (
                                                                <ListInput
                                                                    key={answerChoice.id}
                                                                    id={answerChoice.id}
                                                                    index={index}
                                                                    value={
                                                                        field.value[index]
                                                                            ?.choice || ""
                                                                    }
                                                                    removeItem={removeAnswerChoice}
                                                                    onChange={(
                                                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                                                    ) => {
                                                                        const newValue = [
                                                                            ...field.value,
                                                                        ];
                                                                        newValue[index].choice =
                                                                            e.target.value || "";
                                                                        field.onChange(newValue);
                                                                    }}
                                                                />
                                                            );
                                                        },
                                                    )}
                                                    <AddInput
                                                        onAdd={() => {
                                                            appendAnswerChoice({ choice: " " });
                                                        }}
                                                        text="Add Option +"
                                                    />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </FormProvider>
                    </SheetHeader>
                    <SheetFooter className="flex justify-items-end px-16 py-4">
                        <SheetClose
                            onClick={() =>
                                void form.handleSubmit(submit, (err) => {
                                    console.error(err);
                                })()
                            }
                            disabled={loading}
                            className="w-40 h-12 bg-[hsl(var(--primary))] disabled:bg-slate-400 text-white rounded-lg"
                        >
                            Save Question
                        </SheetClose>
                    </SheetFooter>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
