import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";

interface Question {
    id: number;
    type: string;
    text: string;
}

const mockData: Record<string, Question[]> = {
    [dayjs().format("YYYY-MM-DD")]: [
        { id: 1, type: "Multiple Choice", text: "What is cognitive load?" },
        {
            id: 2,
            type: "Short Answer",
            text: "Explain the concept of attention spanaaaaa. Explain the concept of attention span. Explain the concept of attention span.Explain the concept of attention span.Explain the concept of attention span.Explain the concept of attention span.",
        },
        { id: 3, type: "Short Answer", text: "Explain the concept of attention span." },
        { id: 4, type: "Short Answer", text: "Explain the concept of attention span." },
    ],
};

const SlidingCalendar: React.FC = () => {
    const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf("week"));
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

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
                className="flex flex-col space-y-4 w-full max-w-screen-xl p-4 bg-white rounded-[20px] border border-[#A5A5A5]"
            >
                <div className="flex flex-wrap justify-center sm:justify-between gap-3">
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
                {questionsForDay.length > 0 && (
                    <div className="mt-4 max-h-[250px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        {questionsForDay.map((question) => (
                            <div
                                key={question.id}
                                className="relative w-full h-[173px] p-4 bg-[#F2F5FF] border border-[#A5A5A5] rounded-xl cursor-pointer flex justify-between items-start"
                            >
                                <div className="w-full">
                                    <h2 className="text-[15px] font-normal text-[#18328D]">
                                        {question.type}
                                    </h2>
                                    <p className="text-base font-normal text-black mt-2 line-clamp-3 overflow-hidden text-ellipsis">
                                        {question.text}
                                    </p>
                                </div>
                                <MessageSquare className="text-[#18328D] w-6 h-6 absolute top-2 right-2" />
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SlidingCalendar;
