import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PictureInPicture2, Trash2 } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog";
import { Question } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { deleteQuestion, findQuestionsByCourseSession } from "@/services/question";
import { questionTypeMap } from "@/lib/constants";
import { AddEditQuestionForm } from "../AddEditQuestionForm";
import { formatDateToISO } from "@/lib/utils";

interface Props {
    courseId: number;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    refreshTrigger?: boolean;
}

function SlidingCalendar({
    courseId,
    selectedDate: selectedDateProp,
    onDateChange,
    refreshTrigger,
}: Props) {
    const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf("week"));
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [questions, setQuestions] = useState<
        (Question & { options: { id: number; text: string; isCorrect: boolean }[] })[] | null
    >(null);
    const [selectedQuestion, setSelectedQuestion] = useState<
        (Question & { options: { id: number; text: string; isCorrect: boolean }[] }) | null
    >(null);
    const [correctOptions, setCorrectOptions] = useState<
        { id: number; text: string; isCorrect: boolean }[]
    >([]);
    const [incorrectOptions, setIncorrectOptions] = useState<
        { id: number; text: string; isCorrect: boolean }[]
    >([]);
    const { toast } = useToast();

    useEffect(() => {
        const currentDate = dayjs().startOf("day");
        setSelectedDate(currentDate);
    }, []);

    const fetchQuestions = async (date: Date) => {
        const res = await findQuestionsByCourseSession(courseId, date);
        if (res && "error" in res) toast({ variant: "destructive", description: res?.error ?? "" });
        else {
            setQuestions(res);
            if (selectedQuestion) {
                let updatedQuestion = res?.find(
                    (question: Question) => question.id === selectedQuestion.id,
                );
                console.log("updated", updatedQuestion);
                if (updatedQuestion) setSelectedQuestion(updatedQuestion);
            }
        }
    };

    useEffect(() => {
        const newDate = selectedDateProp ? dayjs(selectedDateProp) : selectedDate;
        setSelectedDate(newDate);
        if (newDate) {
            fetchQuestions(newDate.toDate());
        }
    }, [selectedDateProp, refreshTrigger]);

    // fetch incorrect and correct options of selected question
    useEffect(() => {
        const getOptions = async () => {
            if (!selectedQuestion) return;
            let correct = selectedQuestion.options.filter((option) => option.isCorrect) ?? [];
            let incorrect = selectedQuestion.options.filter((option) => !option.isCorrect) ?? [];
            setCorrectOptions(correct);
            setIncorrectOptions(incorrect);
        };
        getOptions();
    }, [selectedQuestion]);

    const slideLeft = () => setStartDate((prev) => prev.subtract(7, "day"));
    const slideRight = () => setStartDate((prev) => prev.add(7, "day"));

    const dates: Dayjs[] = Array.from({ length: 7 }, (_, i) => startDate.add(i, "day"));

    const handleQuestionClick = (
        question: Question & { options: { id: number; text: string; isCorrect: boolean }[] },
    ) => {
        setSelectedQuestion(question);
    };

    const handleQuestionDelete = async (questionId: number) => {
        await deleteQuestion(questionId)
            .then((res) => {
                if (res && "error" in res)
                    return toast({
                        variant: "destructive",
                        description: res?.error ?? "",
                    });
                else {
                    fetchQuestions(selectedDate?.toDate());
                    toast({
                        description: "Question deleted successfully",
                    });
                }
            })
            .catch((err: unknown) => {
                console.error(err);
                return toast({
                    variant: "destructive",
                    description: "Unknown error occurred",
                });
            });
    };

    return (
        <div className="flex flex-col items-center space-y-4 w-full">
            <section className="w-full max-w-screen-xl flex justify-between items-center">
                <h1 className="font-medium text-2xl sm:text-4xl">
                    <span className="text-black">{startDate.format("MMMM")}</span>{" "}
                    <span className="text-[#18328D]">{startDate.format("YYYY")}</span>
                </h1>
                <div className="flex gap-4">
                    <Button
                        onClick={slideLeft}
                        className="text-xs font-normal text-[#434343] bg-white border border-[#D9D9D9] rounded-2xl hover:bg-white"
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={slideRight}
                        className="text-xs font-normal text-white bg-[#18328D] rounded-2xl hover:bg-[#18328D]"
                    >
                        Next
                    </Button>
                </div>
            </section>

            <motion.div
                key={startDate.toString()}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col space-y-4 w-full max-w-screen-xl p-4 bg-white rounded-[20px] border border-[#A5A5A5] h-[460px] max-h-[460px]"
            >
                <div className="flex justify-center sm:justify-between gap-3 pb-4">
                    {dates.map((date, index) => {
                        const formattedDay = date.format("ddd");
                        const formattedMonthDay = date.format("DD");

                        return (
                            <button
                                key={index}
                                className={`w-[50px] sm:w-[68px] aspect-square rounded-md sm:rounded-full text-center flex flex-col items-center justify-center transition-all ${
                                    selectedDate?.isSame(date, "day")
                                        ? "bg-[#18328D] text-white"
                                        : "bg-white text-black"
                                }`}
                                onClick={() => {
                                    setSelectedDate(date);
                                    if (onDateChange) {
                                        onDateChange(date.toDate());
                                    }
                                }}
                            >
                                <span
                                    className={`text-xs sm:text-lg font-normal ${
                                        selectedDate?.isSame(date, "day")
                                            ? "text-white"
                                            : "text-black"
                                    }`}
                                >
                                    {formattedDay}
                                </span>
                                <span
                                    className={`text-sm sm:text-2xl font-normal ${
                                        selectedDate?.isSame(date, "day")
                                            ? "text-white"
                                            : "text-black"
                                    }`}
                                >
                                    {formattedMonthDay}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {questions && questions.length > 0 ? (
                    <div className="mt-4 h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 w-full justify-items-center">
                        {questions.map((question) => (
                            <div
                                key={question.id}
                                className="relative w-[95%] h-[200px] p-4 m-4 bg-white border border-[#D9D9D9] rounded-xl shadow-md shadow-slate-400 cursor-pointer flex justify-between items-start"
                                onClick={() => handleQuestionClick(question)}
                            >
                                <div className="w-[90%]">
                                    <h2 className="text-[15px] font-normal text-[#18328D]">
                                        {questionTypeMap[question.type]}
                                    </h2>
                                    <p
                                        className="text-base font-normal text-black mt-2 line-clamp-5 break-words overflow-wrap break-word"
                                        title={question.text}
                                    >
                                        {question.text}
                                    </p>
                                </div>
                                <Trash2
                                    className="mx-3 min-w-[20px] min-h-auto text-red-800"
                                    onClick={async () => {
                                        handleQuestionDelete(question.id);
                                    }}
                                />
                                <Dialog>
                                    <DialogTrigger>
                                        <PictureInPicture2 />
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[80vw] lg:max-w-[70vw] h-[90vh]">
                                        <DialogHeader>
                                            <DialogTitle className="flex flex-col gap-6">
                                                <p className="text-xl text-[#18328D] font-normal">
                                                    {selectedQuestion
                                                        ? questionTypeMap[selectedQuestion.type]
                                                        : "Unknown Question Type"}
                                                </p>{" "}
                                                <p className="text-4xl text-[#434343] font-normal">
                                                    {selectedQuestion?.text}
                                                </p>
                                                <hr className="border-t border-[#D9D9D9] w-full"></hr>
                                            </DialogTitle>
                                            <DialogDescription asChild>
                                                <div className="flex flex-col items-center h-full">
                                                    <section className="flex flex-col items-center space-y-12 flex-grow">
                                                        <h1 className="text-center text-2xl text-black font-normal mt-10">
                                                            Answer Choices:
                                                        </h1>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-x-32 sm:gap-y-20">
                                                            {selectedQuestion?.options?.map(
                                                                (option) => (
                                                                    <button
                                                                        key={option.id}
                                                                        className={`w-[184px] text-black text-xl font-normal p-4 rounded-[20px] border border-[#D9D9D9] ${
                                                                            option.isCorrect
                                                                                ? "bg-[#479B78]"
                                                                                : "bg-white"
                                                                        } text-ellipsis overflow-hidden whitespace-nowrap`}
                                                                        title={option.text}
                                                                    >
                                                                        {option.text}
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </section>
                                                    <section className="flex gap-6 items-center ml-0 sm:ml-auto mt-auto mr-0 sm:mr-8 mb-0 sm:mb-2">
                                                        <AddEditQuestionForm
                                                            courseId={courseId}
                                                            location="page"
                                                            questionId={question.id}
                                                            onUpdate={() =>
                                                                fetchQuestions(
                                                                    selectedDate.toDate(),
                                                                )
                                                            }
                                                            prevData={{
                                                                question: question.text,
                                                                selectedQuestionType:
                                                                    question.type === "MCQ"
                                                                        ? "Multiple Choice"
                                                                        : "Select All",
                                                                date: selectedDate.toDate(),
                                                                correctAnswers: correctOptions.map(
                                                                    (option) => {
                                                                        return {
                                                                            answer: option.text,
                                                                        };
                                                                    },
                                                                ),
                                                                answerChoices: incorrectOptions.map(
                                                                    (option) => {
                                                                        return {
                                                                            choice: option.text,
                                                                        };
                                                                    },
                                                                ),
                                                            }}
                                                        />

                                                        <DialogClose className="text-base sm:text-xl font-normal px-5 sm:px-10 py-3 bg-[#18328D] text-white rounded-xl">
                                                            Done
                                                        </DialogClose>
                                                    </section>
                                                </div>
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center w-full h-full gap-6">
                        <p className="text-gray-400 text-2xl font-normal">
                            No Questions Assigned On This Day
                        </p>
                        <AddEditQuestionForm
                            courseId={courseId}
                            location="calendar"
                            defaultDate={new Date(formatDateToISO(selectedDate?.toDate()))}
                            onUpdate={() => fetchQuestions(selectedDate.toDate())}
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default SlidingCalendar;
