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
                console.log(code);
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
                    {/* Title */}
                    <h1 className="text-[35px] leading-[42px] font-normal text-black text-center">
                        Add a class
                    </h1>

                    {/* Course Name */}
                    <h2 className="text-[20px] leading-[24px] font-normal text-black text-center">
                        COGS 101B: Learning, Memory, & Attention
                    </h2>

                    {/* Class Code */}
                    <div className="w-full">
                        <label className="text-[20px] leading-[24px] font-normal text-black">
                            Class Code:
                        </label>
                        <input
                            type="text"
                            className="h-[43px] w-[167px] px-5 bg-[#F2F5FF] text-black rounded-[10px] border border-gray-300 text-lg mt-2"
                            {...register("code")}
                        />
                        {error && (
                            <p className="text-red-700 mt-2 text-center">{error}</p>
                        )}
                    </div>

                    {/* Days of the Week */}
                    <div className="w-full">
                        <label className="text-[20px] leading-[24px] font-normal text-black">
                            Days of the Week:
                        </label>
                        <div className="w-[364px] h-[56px] flex gap-2 justify-start">
                            {["M", "T", "W", "Th", "F"].map((day) => (
                                <div
                                    key={day}
                                    className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-400 text-lg"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assign Color */}
                    <div className="w-full">
                        <label className="text-[20px] leading-[24px] font-normal text-black">
                            Assign Color:
                        </label>
                        <div className="flex gap-3">
                            {["#FF6B6B", "#FFB84C", "#E7D664", "#66D96D", "#8669F7"].map(
                                (color) => (
                                    <div
                                        key={color}
                                        className="w-[56px] h-[56px] rounded-full"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!code}
                        className="py-3 w-[225px] h-[56px] bg-[#18328D] disabled:bg-[#CFDAFF] text-white rounded-lg text-[20px] font-medium transition duration-200 ease-in-out hover:bg-[#10236A] disabled:cursor-not-allowed"
                    >
                        Add Class
                    </button>
                </form>
            ) : (
                <div className="flex flex-col justify-center items-center gap-9 pt-32 w-full max-w-md">
                    <h1 className="text-[35px] leading-[42px] font-normal text-black text-center">
                        You have been <br /> successfully added to:
                    </h1>

                    <h1 className="text-[35px] leading-[42px] font-semibold text-primary text-center">
                        {course}
                    </h1>

                    {/* Continue Button */}
                    <Link href="/dashboard">
                        <button className="py-3 w-full max-w-md bg-[#18328D] text-white border border-[#18328D] rounded-lg text-lg font-medium transition duration-200 ease-in-out hover:bg-[#10236A]">
                            Continue
                        </button>
                    </Link>

                    {/* Send Email Confirmation Button */}
                    <button className="py-3 w-full max-w-md bg-white text-[#18328D] border border-[#18328D] rounded-lg text-lg font-medium transition duration-200 ease-in-out hover:bg-gray-100">
                        Send email confirmation
                    </button>
                </div>
            )}
        </div>
    );
}