"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { getCourseWithCode } from "@/services/course";
import { addUserToCourse } from "@/services/userCourse";

export default function Page() {
    const session = useSession();
    const { register, handleSubmit, watch } = useForm<{
        code: string;
    }>();

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
            console.log("Error adding user to the course", err);
            setError("Something went wrong");
        }
    };

    return (
        <>
            {!course ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSubmit(() => onFormSubmit())();
                    }}
                    className="flex flex-col justify-center items-center gap-6 pt-72"
                >
                    <h1 className="text-3xl mb-5">Enter Classroom Code:</h1>
                    <div className="mb-8">
                        <input
                            type="text"
                            className="h-[3.5rem] w-80 px-5 bg-[#F2F5FF] text-black rounded-[10px]"
                            {...register("code")}
                        ></input>
                        {error && (
                            <p className="text-red-700 mt-2 absolute left-1/2 -translate-x-1/2">
                                {error}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={code ? false : true}
                        className="py-3 px-12 bg-[#18328D] disabled:bg-[#CFDAFF] text-white rounded-lg"
                    >
                        Enter
                    </button>
                </form>
            ) : (
                <div className="flex flex-col justify-center items-center gap-9 pt-44">
                    <h1 className="text-3xl text-center">
                        You have been <br /> successfully added to:
                    </h1>
                    <h1 className="text-3xl pb-16">{course}</h1>
                    <Link href="/course-list">
                        <button className="py-2 w-72 px-6 bg-[#18328D] text-white border border-[#18328D] rounded-lg text-center mx-auto block">
                            Continue
                        </button>
                    </Link>
                    <button className="py-2 w-72 bg-white text-[#18328D] border border-[#18328D] rounded-lg">
                        Send email confirmation
                    </button>
                </div>
            )}
        </>
    );
}
