import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PictureInPicture2, Pencil } from "lucide-react";
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

interface Props {
    courseId: number;
}

function SlidingCalendar({ courseId }: Props) {
    const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf("week"));
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [questions, setQuestions] = useState<
        (Question & { options: { id: number; text: string; isCorrect: boolean }[] })[] | null
    >(null);
    const [selectedQuestion, setSelectedQuestion] = useState<
        (Question & { options: { id: number; text: string; isCorrect: boolean }[] }) | null
    >(null);
    const { toast } = useToast();

    useEffect(() => {
        const currentDate = dayjs();
        setSelectedDate(currentDate);
        handleDayClick(currentDate);
    }, []);

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

    const handleQuestionClick = (
        question: Question & { options: { id: number; text: string; isCorrect: boolean }[] },
    ) => {
        setSelectedQuestion(question);
    };

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
                            <button
                                key={index}
                                className={`w-[50px] sm:w-[68px] aspect-square rounded-md sm:rounded-full text-center flex flex-col items-center justify-center transition-all ${
                                    selectedDate?.isSame(date, "day")
                                        ? "bg-[#18328D] text-white"
                                        : "bg-white text-black"
                                }`}
                                onClick={() => handleDayClick(date)}
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
                    <div className="mt-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-full justify-items-center">
                        {questions.map((question) => (
                            <div
                                key={question.id}
                                className="relative w-[95%] h-[200px] p-4 m-4 bg-white border border-[#D9D9D9] rounded-xl shadow-md shadow-slate-400 cursor-pointer flex justify-between items-start"
                                onClick={() => handleQuestionClick(question)}
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
                                                                        }`}
                                                                    >
                                                                        {option.text}
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </section>
                                                    <section className="flex gap-6 items-center ml-0 sm:ml-auto mt-auto mr-0 sm:mr-8 mb-0 sm:mb-2">
                                                        <button className="text-base sm:text-xl font-normal px-5 sm:px-8 py-3 bg-[#F2F5FF] text-[#18328D] rounded-xl border border-[#A5A5A5] flex flex-row items-center gap-2">
                                                            Edit Question <Pencil />
                                                        </button>
                                                        <button className="text-base sm:text-xl font-normal px-5 sm:px-10 py-3 bg-[#18328D] text-white rounded-xl">
                                                            Done
                                                        </button>
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
