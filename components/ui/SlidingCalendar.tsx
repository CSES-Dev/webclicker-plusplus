import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PictureInPicture2 } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog";
import { Question } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { findQuestionsByCourseSession } from "@/services/question";
import { questionTypeMap } from "@/lib/constants";

interface QuestionMock {
    id: number;
    type: string;
    text: string;
}

const mockData: Record<string, QuestionMock[]> = {
    [dayjs().format("YYYY-MM-DD")]: [
        { id: 1, type: "Multiple Choice", text: "What is cognitive load?" },
        {
            id: 2,
            type: "Short Answer",
            text: "Explain the concept of attention spanaaaaa. Explain the concept of attention span. Explain the concept of attention span.Explain the concept of attention span.Explain the concept of attention span.Explain the concept of attention span.",
        },
        { id: 3, type: "Short Answer", text: "Explain the concept of attention span." },
        // { id: 4, type: "Short Answer", text: "Explain the concept of attention span." },
        // { id: 5, type: "Short Answer", text: "Explain the concept of attention span." },
        // { id: 6, type: "Short Answer", text: "Explain the concept of attention span." },
        // { id: 7, type: "Short Answer", text: "Explain the concept of attention span." },
    ],
};

interface Props {
    courseId: number;
}

function SlidingCalendar({ courseId }: Props) {
    const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf("week"));
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [questions, setQuestions] = useState<Question[] | null>();
    const { toast } = useToast();

    useEffect(() => {
        const fetchQuestions = async () => {
            const date = selectedDate?.toDate();
            if (date) {
                await findQuestionsByCourseSession(courseId, date).then((res) => {
                    if (res && "error" in res)
                        return toast({ variant: "destructive", description: res?.error ?? "" });
                    else {
                        setQuestions(res);
                        console.log(res);
                    }
                });
            }
        };
        fetchQuestions();
    }, [selectedDate]);

    const slideLeft = () => setStartDate((prev) => prev.subtract(7, "day"));
    const slideRight = () => setStartDate((prev) => prev.add(7, "day"));

    const dates: Dayjs[] = Array.from({ length: 7 }, (_, i) => startDate.add(i, "day"));

    const handleDayClick = (date: Dayjs) => {
        setSelectedDate(date);
    };

    const formattedSelectedDate = selectedDate?.format("YYYY-MM-DD");
    const questionsForDay = formattedSelectedDate ? mockData[formattedSelectedDate] || [] : [];

    return (
        <div className="flex flex-col items-center space-y-4 w-full">
            <section className="w-full flex justify-between items-center">
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
                            <div
                                key={index}
                                className={`w-[50px] h-[50px] sm:w-[68px] sm:h-[68px] rounded-full text-center cursor-pointer flex flex-col items-center justify-center transition-all ${
                                    selectedDate?.isSame(date, "day")
                                        ? "bg-[#18328D] text-white"
                                        : "bg-white text-black"
                                }`}
                                onClick={() => handleDayClick(date)}
                            >
                                <span
                                    className={`text-sm sm:text-lg font-normal ${
                                        selectedDate?.isSame(date, "day")
                                            ? "text-white"
                                            : "text-black"
                                    }`}
                                >
                                    {formattedDay}
                                </span>
                                <span
                                    className={`text-lg sm:text-2xl font-normal ${
                                        selectedDate?.isSame(date, "day")
                                            ? "text-white"
                                            : "text-black"
                                    }`}
                                >
                                    {formattedMonthDay}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {questions && questions.length > 0 ? (
                    <div className="mt-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-full justify-items-center">
                        {questions.map((question) => (
                            <div
                                key={question.id}
                                className="relative w-[95%] h-[200px] p-4 m-4 bg-white border border-[#D9D9D9] rounded-xl shadow-lg shadow-slate-400 cursor-pointer flex justify-between items-start"
                            >
                                <div className="w-full">
                                    <h2 className="text-[15px] font-normal text-[#18328D]">
                                        {questionTypeMap[question.type]}
                                    </h2>
                                    <p className="text-base font-normal text-black mt-2 line-clamp-3 overflow-hidden text-ellipsis">
                                        {question.text}
                                    </p>
                                </div>
                                <Dialog>
                                    <DialogTrigger>
                                        <PictureInPicture2 className="text-[#18328D] w-6 h-6 absolute top-2 right-2" />
                                    </DialogTrigger>
                                    <DialogContent className="w-[75vh] max-w-[75v] h-[75vh] max-h-[75vh]">
                                        <DialogHeader>
                                            <DialogTitle className="flex flex-col">
                                                <h1 className="text-xl text-[#18328D] font-base">Multiple Choice</h1>
                                                <p className="text-4xl text-[#434343] font-base">What is a string?</p>
                                            </DialogTitle>
                                            <hr className="border-t border-[#D9D9D9]">
                                            <DialogDescription className="flex flex-col items-center space-y-4">
                                                <h1 className="text-center text-xl font-semibold">Answer Choices:</h1>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button className="bg-[#18328D] text-white p-4 rounded-lg">Option 1</button>
                                                    <button className="bg-[#18328D] text-white p-4 rounded-lg">Option 2</button>
                                                    <button className="bg-[#18328D] text-white p-4 rounded-lg">Option 3</button>
                                                    <button className="bg-[#18328D] text-white p-4 rounded-lg">Option 4</button>
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
                            No Questions Assigned on this Day
                        </p>
                        <p className="text-[#18328D] text-2xl font-normal">Add Question?</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default SlidingCalendar;
