"use client";
import { QuestionType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { IconQuestionButton } from "@/components/ui/plus-icon-button";
import { getCourseSessionByDate, getQuestionsForSession } from "@/services/session";

const chartData = [
    { option: "A.", Votes: 200 },
    { option: "B.", Votes: 395 },
    { option: "C.", Votes: 109 },
    { option: "D.", Votes: 75 },
];

const totalVotes = chartData.reduce((sum, item) => sum + item.Votes, 0);

const chartConfig: ChartConfig = {
    Votes: {
        label: "Votes",
        color: "hsl(var(--chart-1))",
    },
};

export default function StartSession() {
    const [date] = useState(new Date()); // TODO wondering what time zone this is using    

    // active question we are currently at. Gathered from db in case of refresh
    const [activeQuestionId, setActiveQuestionId] = useState(null); // TODO need to update this here and in db whenever next question and wild card is added 

    //questions array containing questions for session gathered from db
    const [questions, setQuestions] = useState([]);  // TODO need to update here and in db  whenever wilcard is added

    // total size of questioons array 
    const [totalQuestions, setTotalQuestions] = useState(null); // TODO need to update here  whenever wilcard is added

    // CourseSessionId
    const [courseSessionId, setCourseSessionId] = useState(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Example session id for demonstration purposes. should be linked up later
    const courseId = 45;

    // Fetch some info
    useEffect(() => {
        async function fetchCourseSession() {
            // Fetch CourseSession based on courseId and date
            const courseSession = await getCourseSessionByDate(courseId, date);
            if (courseSession) {
                console.log("date =", date.toISOString().split('T')[0]);
    
                // Set CourseSessionId variable
                setCourseSessionId(courseSession.id);
                console.log("courseSessionID (before state update) =", courseSession.id);
    
                // Set activeQuestionId variable
                setActiveQuestionId(courseSession.activeQuestionId);
                console.log("activeQuestionId (before state update) =", courseSession.activeQuestionId);
    
                // Fill questions array variable
                const sessionQuestions = await getQuestionsForSession(courseSession.id);
                setQuestions(sessionQuestions);
                console.log("questions (before state update) =", sessionQuestions);
    
                // Set totalQuestions variable
                setTotalQuestions(sessionQuestions.length);
                console.log("totalQuestions (before state update) =", sessionQuestions.length);
            }
        }
        fetchCourseSession();
    }, [courseId, date]); // TODO whenever these change it reruns the effect but not sure if necessary yet


    const handleNextQuestion = () => {
        // Find the current question based on activeQuestionId

        const currentQuestionIndex = questions.findIndex(q => q.id === activeQuestionId);
        // currentQuestionIndex = questions.findIndex(q => q.id === activeQuestionId);
    
        // Check if the current question index is valid and less than totalQuestions - 1
        if (currentQuestionIndex !== -1 && currentQuestionIndex < totalQuestions - 1) {
            // Get the next question's Id
            const nextQuestionID = questions[currentQuestionIndex + 1].id;
            // Set the activeQuestionId to the next question's ID
            setActiveQuestionId(nextQuestionID);
            console.log("activeQuestionId (after state update) =", nextQuestionID);
        }
    };

    // TODO handler to add a wildcard question.
    const handleAddWildcard = async (selectedType: QuestionType) => {
        try {
            const position = currentQuestionIndex + 1;
            const res = await fetch(`/api/session/${sessionId}/wildcard`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position, questionType: selectedType }),
            });
            if (!res.ok) {
                throw new Error("Failed to add wildcard question");
            }
            const newQuestion = await res.json();
            console.log("Wildcard question created:", newQuestion);
        } catch (error) {
            console.error(error);
        }
    };

    // TODO updates when clicking wildcard
    const activeQuestion = questions.find(q => q.id === activeQuestionId);

    return (
        <div className="flex flex-col items-center p-4">
            {/* Top row with Back button + date */}
            <div className="flex justify-between w-full mb-4">
                <Button className="bg-[#18328D] text-white" variant="outline">
                    &lt; Back
                </Button>
                {date.toDateString()}
            </div>

            {/* Card to hold question and chart */}
            <div className="w-full max-w-4xl">
                <Card>
                    <CardHeader className="border border-[hsl(var(--input-border))] rounded-md">
                        <Badge className="bg-[#EDEDED] text-[#5C0505] max-w-max mb-2 hover:bg-[none]">
                            {activeQuestion?.type}
                        </Badge>
                        <CardTitle className="text-base md:text-xl">{activeQuestion?.text}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full text-base md:text-l">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} layout="vertical" barCategoryGap={20}>
                                    <XAxis type="number" domain={[0, totalVotes]} hide />
                                    <YAxis
                                        dataKey="option"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        style={{ fill: "#000" }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar
                                        dataKey="Votes"
                                        fill="#F3AB7E"
                                        barSize={30}
                                        radius={[5, 5, 5, 5]}
                                        background={{
                                            fill: "#fff",
                                            stroke: "#959595",
                                            strokeWidth: 0.5,
                                            radius: 5,
                                        }}
                                    >
                                        <LabelList
                                            dataKey="Votes"
                                            position="right"
                                            offset={10}
                                            formatter={(value: number) => {
                                                const percent = (value / totalVotes) * 100;
                                                return `${percent.toFixed(1)}%`;
                                            }}
                                            style={{ fill: "#000", fontSize: 12 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Next Question and Wildcard Button */}
            <div className="flex items-center justify-end w-full max-w-4xl mt-4 gap-2">
                <IconQuestionButton onSelect={handleAddWildcard} />
                <Button onClick={handleNextQuestion}>Next Question &gt;</Button>
            </div>
        </div>
    );
}
