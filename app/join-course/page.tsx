"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import BackButton from "@/components/ui/backButton";
import { useToast } from "@/hooks/use-toast";
import { getCourseWithCode } from "@/services/course";
import { addUserToCourse } from "@/services/userCourse";

export default function Page() {
    const session = useSession();
    const { register, handleSubmit, watch } = useForm<{
        code: string;
    }>();
    const { toast } = useToast();

    const code = watch("code");
    const [course, setCourse] = useState<string>();

    const user = session?.data?.user ?? { id: "", firstName: "" };

    const onFormSubmit = async () => {
        try {
            if (!code) {
                toast({ variant: "destructive", description: "Invalid code" });
            } else {
                console.log(code);
                const courseInfo = await getCourseWithCode(code);
                if (!courseInfo) {
                    toast({ variant: "destructive", description: "Invalid code" });

                    return;
                }
                const res = await addUserToCourse(courseInfo.id, user.id);
                if (res?.error) toast({ variant: "destructive", description: res?.error });
                else setCourse(courseInfo.title);
            }
        } catch (err) {
            console.error("Error adding user to the course", err);
            toast({ variant: "destructive", description: "Something went wrong" });
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen px-6 mt-10">
            <div>
                <BackButton href="/dashboard" />
            </div>
            {!course ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSubmit(() => onFormSubmit())();
                    }}
                    className="flex flex-col justify-center items-center gap-6 pt-32 w-full max-w-md"
                >
                    <h1 className="text-[30px] leading-[42px] font-normal text-black text-center">
                        Enter Classroom Code:
                    </h1>
                    <input
                        type="text"
                        className="h-[50px] w-[300px] px-4 bg-[#F2F5FF] text-black rounded-[10px] border border-gray-300 text-lg"
                        {...register("code")}
                    />

                    <button
                        type="submit"
                        disabled={!code}
                        className="py-2 px-6 bg-[#CFDAFF] text-[#18328D] rounded-lg text-[16px] font-medium transition duration-200 ease-in-out hover:bg-[#18328D] hover:text-white disabled:cursor-not-allowed disabled:bg-[#E0E7FF]"
                    >
                        Enter
                    </button>
                </form>
            ) : (
                <div className="flex flex-col justify-center items-center gap-9 pt-32 w-full max-w-md">
                    <h1 className="text-[35px] leading-[42px] font-normal text-black text-center">
                        You have been successfully added to:
                    </h1>
                    <h1 className="text-[35px] leading-[42px] font-semibold text-primary text-center">
                        {course}
                    </h1>
                    <Link href="/dashboard">
                        <button className="py-3 w-full max-w-md bg-[#18328D] text-white border border-[#18328D] rounded-lg text-lg font-medium transition duration-200 ease-in-out hover:bg-[#10236A]">
                            Continue
                        </button>
                    </Link>
                    <button className="py-3 w-full max-w-md bg-white text-[#18328D] border border-[#18328D] rounded-lg text-lg font-medium transition duration-200 ease-in-out hover:bg-gray-100">
                        Send email confirmation
                    </button>
                </div>
            )}
        </div>
    );
}
