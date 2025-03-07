"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { getCourseWithCode } from "@/services/course";
import { addUserToCourse } from "@/services/userCourse";

export default function Page() {
    const session = useSession();
    const { register, handleSubmit, watch } = useForm<{ code: string }>();

    const code = watch("code");
    const [course, setCourse] = useState<string>();
    const [error, setError] = useState<string>();

    const user = session?.data?.user ?? { id: "", firstName: "" };

    const onFormSubmit = async () => {
        try {
            if (!code) {
                setError("Invalid code");
            } else {
                const courseInfo = await getCourseWithCode(code);
                if (!courseInfo) {
                    setError("Invalid code");
                    return;
                }
                const res = await addUserToCourse(courseInfo.id, user.id);
                if (res?.error) setError(res.error);
                else setCourse(courseInfo.title);
            }
        } catch (err) {
            console.error("Error adding user to the course", err);
            setError("Something went wrong");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
            {!course ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSubmit(() => onFormSubmit())();
                    }}
                    className="flex flex-col justify-center items-center gap-6 pt-32 w-full max-w-md"
                >
                    <h1 className="text-[35px] leading-[42px] font-normal text-black text-center">
                        Enter Classroom Code:
                    </h1>
                    <input
                        type="text"
                        className="h-[43px] w-[167px] px-5 bg-[#F2F5FF] text-black rounded-[10px] border border-gray-300 text-lg mt-2"
                        {...register("code")}
                    />
                    {error && <p className="text-red-700 mt-2 text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={!code}
                        className="py-3 w-[225px] h-[56px] bg-[#18328D] disabled:bg-[#CFDAFF] text-white rounded-lg text-[20px] font-medium transition duration-200 ease-in-out hover:bg-[#10236A] disabled:cursor-not-allowed"
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