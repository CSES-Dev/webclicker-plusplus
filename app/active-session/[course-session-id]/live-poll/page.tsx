'use client'; 
import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import QuestionCard from "@/components/ui/questionCard";
import AnswerOptions from "@/components/ui/answerOptions";
import Header from "@/components/ui/header";
import BackButton from "@/components/ui/backButton";

interface Option {
    id: number;
    questionId: number;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: number;
    sessionId: number;
    text: string;
    type: "MCQ" | "MSQ"; 
    options: Option[];
    topic: string;    
}

// This would eventually come from an API call
const mockQuestions: Question[] = [
    // {
    //   id: 4,
    //   sessionId: 1,
    //   text: "Which of the following are JavaScript frameworks or libraries? (Select all that apply)",
    //   type: "MSQ",
    //   topic: "Web Development",
    //   options: [
    //     { id: 13, questionId: 4, text: "React", isCorrect: true },
    //     { id: 14, questionId: 4, text: "Angular", isCorrect: true },
    //     { id: 15, questionId: 4, text: "Vue", isCorrect: true },
    //     { id: 16, questionId: 4, text: "Python", isCorrect: false }
    //   ]
    // },

    {
      id: 3,
      sessionId: 2,
      text: "Which of the following are JavaScript frameworks or libraries? (Select all that apply)",
      type: "MCQ",
      topic: "Web Dev",
      options: [
        { id: 13, questionId: 4, text: "React", isCorrect: true },
        { id: 14, questionId: 4, text: "Angular", isCorrect: true },
        { id: 15, questionId: 4, text: "Vue", isCorrect: true },
        { id: 16, questionId: 4, text: "Python", isCorrect: false }
      ]
    }
];

export default function LivePoll() {
  // Extract the course-session-id from the URL
  const params = useParams();
  const courseSessionId = params['course-session-id'];

  // State for the current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Unified state for selected values (either single number or array of numbers)
  const [selectedValues, setSelectedValues] = useState<number | number[] | null>(null);

  // Get the current question
  const currentQuestion = mockQuestions[currentQuestionIndex];

  const questionCount = `${currentQuestionIndex + 1}/${mockQuestions.length}`;
  const progressPercent = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;


  
  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;
  
  // Handle answer selection (works for both MCQ and MSQ)
  const handleSelectionChange = (value: number | number[]) => {
      setSelectedValues(value);
      // In a real app, you'd send this selection to the backend
  };
  
  // Handle going to the next question
  const handleNextQuestion = () => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedValues(null);
      }
  };
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <Header />
        
        <div className="p-4 sm:p-6 flex flex-col items-center">
          {/* Back Button */}
          <div className="self-start mb-6 mt-2">
            <BackButton href="/dashboard" />
          </div>
          
          {/* Question header and count */}
          <div className="w-full max-w-[330px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[20px] font-medium">Live Question:</h2>
              <span className="text-lg">{questionCount}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div 
                className="h-full  bg-custom-background rounded-full" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            {/* Topics */}
            <div className="flex justify-end items-center mb-4">
              <span className="mr-2 text-[16px] font-medium">Topics:</span>
              <span className="px-4 py-1 bg-green-300 rounded-full text-[12px] text-center">
                {currentQuestion.topic}
              </span>
            </div>
          </div>
          
          {/* Question Card - simplified */}
          <div className="w-full max-w-md">
            <QuestionCard question={currentQuestion.text} />
          </div>
          
          {/* Answer Options */}
          <AnswerOptions 
            options={currentQuestion.options}
            questionType={currentQuestion.type}
            selectedValues={selectedValues}
            onSelectionChange={handleSelectionChange}
          />
          
          {/* Footer Message */}
          {currentQuestionIndex === mockQuestions.length - 1 ? (
            <p className="mt-6 text-[14px] text-gray-500 text-center">
              This is the last question.
            </p>
          ) : (
            <p className="mt-6 text-[14px] text-gray-500 text-center">
              Instructor will start the next question shortly...
            </p>
          )}
        </div>
      </div>
    );
  }