import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Question } from "@prisma/client";
import { questionTypeMap } from "@/lib/constants";

interface Props {
  courseId: number;
}

function PastQuestions({ courseId }: Props) {
  const mockQuestions = [
    {
      id: 1,
      text: "Is San Diego the best city in Cali?",
      type: "TF",
      score: 100,
      studentAnswer: "True",
    },
    {
      id: 2,
      text: "Which of these are UC schools?",
      type: "MSQ",
      score: 50,
      studentAnswer: "UCSD, UCI",
    },
    {
      id: 3,
      text: "What is 2 + 2?",
      type: "MCQ",
      score: 0,
      studentAnswer: "5",
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <section className="w-full max-w-screen-xl flex justify-between items-center">
        <h1 className="font-medium text-2xl sm:text-4xl text-black">
          Past Questions
        </h1>
      </section>

      <div className="w-full max-w-screen-xl bg-white rounded-[20px] border border-[#A5A5A5] overflow-hidden">
        {/* Filter row */}
        <div className="grid grid-cols-12 items-center p-6 bg-[#F2F5FF] border-b border-[#D9D9D9]">
          <div className="col-span-7 flex items-center space-x-4">
            <span className="text-sm font-medium text-[#434343]">
              Question Type:
            </span>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Multiple Choice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCQ">Multiple Choice</SelectItem>
                <SelectItem value="MSQ">Select All</SelectItem>
                <SelectItem value="TF">True/False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-3 flex justify-center">
            <span className="text-sm font-medium text-[#434343]">Score</span>
          </div>
          <div className="col-span-2"></div>
        </div>

        {/* Questions table */}
        <div className="divide-y divide-[#D9D9D9]">
          {mockQuestions.map((question) => (
            <div key={question.id} className="grid grid-cols-12 items-center p-6">
              {/* Question column */}
              <div className="col-span-7">
                <span className="text-xs font-medium text-[#18328D] bg-[#E6EAF1] px-2 py-1 rounded">
                  {questionTypeMap[question.type as keyof typeof questionTypeMap]}
                </span>
                <p className="mt-2 text-base font-normal text-black">
                  {question.text}
                </p>
              </div>

              {/* Score column */}
              <div className="col-span-3 flex justify-center">
                <span className="text-2xl font-medium text-[#18328D]">
                  {question.score}
                </span>
              </div>

              {/* Student Answer column */}
              <div className="col-span-2">
                <div className="p-3 bg-[#F5F5F5] rounded-lg border border-[#D9D9D9]">
                  <p className="text-sm font-normal text-black truncate">
                    {question.studentAnswer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PastQuestions;