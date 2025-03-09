"use client";

import { QuestionType } from "@prisma/client";
import { X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { IconQuestionButton } from "@/components/ui/plus-icon-button";
import { useToast } from "@/hooks/use-toast";
import { addWildcardQuestion } from "@/lib/server-utils";
import { createCourseSession } from "@/services/courseSession";

export default function BeginPollDialog() {
    const params = useParams();
    const courseId = parseInt(params.courseId as string);
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddWildCard = async (questionType: QuestionType) => {
        try {
            const session = await createCourseSession(courseId);
            if (!session) {
                return toast({
                    variant: "destructive",
                    description: "Error creating session. Please try again",
                });
            }
            if (!session.activeQuestionId) {
                // only add question if poll has not started
                await addWildcardQuestion(session.id, 0, questionType); // position 0 since first question
            }
            router.push(`/dashboard/course/${courseId}/start-session`);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            return toast({
                variant: "destructive",
                description: "Something happened. Please try again",
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger className="py-3 px-10 m-3 bg-[hsl(var(--primary))] text-white text-base sm:text-xl font-normal rounded-xl">
                Begin Poll
            </DialogTrigger>
            <DialogContent className="w-[90%] md:w-[70%] rounded-xl">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
                <DialogHeader className="pt-10 px-3 mx-auto">
                    <DialogTitle className="w-full text-xl mb-5 font-normal">
                        Add questions on the fly or use pre-filled questions
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 md:flex-row justify-around items-center">
                    <IconQuestionButton
                        onSelect={(questionType) => {
                            void handleAddWildCard(questionType);
                        }}
                        label={
                            <Button
                                variant="outline"
                                disabled={isLoading}
                                className="w-40 h-12  disabled:bg-slate-400 rounded-lg"
                            >
                                On the Fly
                            </Button>
                        }
                    ></IconQuestionButton>
                    <span>OR</span>
                    <Button
                        variant="primary"
                        onClick={() => {
                            // router.push("/start-session");
                            router.push(`/dashboard/course/${courseId}/start-session`);
                        }}
                        disabled={isLoading}
                        className="h-12  disabled:bg-slate-400 rounded-lg"
                    >
                        Pre-Filled Questions
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
