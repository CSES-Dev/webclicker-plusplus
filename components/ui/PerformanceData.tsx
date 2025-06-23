import React, { useCallback, useEffect, useState } from "react";
import DonutChart from "@/components/ui/DonutChart";
import { performanceChartConfig } from "@/lib/charts";
import { questionTypeColors, questionTypeMap } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { getLimitedPastQuestions, getResponses } from "@/services/question";
import { getIncorrectAndCorrectResponseCounts, getQuestionsWithAverageScore } from "@/lib/utils";
import { GlobalLoadingSpinner } from "./global-loading-spinner";

interface Props {
    courseId: number;
}
export default function PerformanceData({ courseId }: Props) {
    const [pastQuestions, setPastQuestions] = useState<
        { type: keyof typeof questionTypeMap; title: string; average: number }[]
    >([]);
    const [responseStatistics, setResponseStatistics] = useState<{
        incorrect: number;
        correct: number;
    }>({
        incorrect: 0,
        correct: 0,
    });
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const performanceChartData = [
        { result: "correct", count: responseStatistics.correct, fill: "#BAFF7E" },
        { result: "incorrect", count: responseStatistics.incorrect, fill: "#CCCCCC" },
    ];

    const fetchCourseStatistics = useCallback(async () => {
        try {
            setIsLoading(true);
            const pastQuestionsRes = await getLimitedPastQuestions(courseId, 2);
            if ("error" in pastQuestionsRes) {
                return toast({
                    variant: "destructive",
                    description: pastQuestionsRes?.error ?? "Unknown error occurred.",
                });
            } else {
                setPastQuestions(getQuestionsWithAverageScore(pastQuestionsRes));
            }

            const responses = await getResponses(courseId);
            if (!responses || (typeof responses !== "number" && "error" in responses)) {
                return toast({
                    variant: "destructive",
                    description: responses?.error ?? "Unknown error occurred.",
                });
            } else if (responses) {
                setResponseStatistics(getIncorrectAndCorrectResponseCounts(responses));
            }
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                description: "Unknown error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        void fetchCourseStatistics();
    }, []);

    if (isLoading) {
        return <GlobalLoadingSpinner />;
    }

    return (
        <>
            <div className="max-h-full md:max-w-1/2 flex my-6 mx-auto">
                {/* Donut Chart */}
                {responseStatistics.correct + responseStatistics.incorrect === 0 ? (
                    <span className="h-[330px] w-[330px] flex items-center justify-center">
                        No Responses
                    </span>
                ) : (
                    <DonutChart
                        chartData={performanceChartData}
                        chartConfig={performanceChartConfig}
                        dataKey="count"
                        nameKey="result"
                        description="Class Average"
                        descriptionStatistic={
                            responseStatistics.correct + responseStatistics.incorrect !== 0
                                ? Math.trunc(
                                      (responseStatistics.correct /
                                          (responseStatistics.correct +
                                              responseStatistics.incorrect)) *
                                          100,
                                  )
                                : 0
                        }
                    />
                )}
            </div>
            {/* Past Questions */}
            <div className="hidden md:flex flex-col justify-center items-center w-full md:min-w-[22vw] md:max-w-1/2 h-full gap-3 pr-5">
                {pastQuestions.map((question, idx) => (
                    <div
                        key={idx}
                        className="min-h-28 h-fit w-full p-4 bg-slate-50/10 shadow-md rounded-lg border border-slate-400"
                    >
                        <div className="flex flex-row justify-between">
                            <p
                                className="rounded-sm p-1 px-2 text-sm border"
                                style={{
                                    background: questionTypeColors[question.type]?.bg,
                                    color: questionTypeColors[question.type]?.fg,
                                    borderColor: questionTypeColors[question.type]?.fg,
                                }}
                            >
                                {questionTypeMap[question.type]}
                            </p>
                            <p className="text-lg font-semibold">{question.average}</p>
                        </div>
                        <p className="text-base pt-2">{question.title}</p>
                    </div>
                ))}
            </div>
        </>
    );
}
