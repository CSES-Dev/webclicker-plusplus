"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import AuthButton from "@/components/auth-button";

export default function Login() {
    return (
        <div className="flex w-full flex-col lg:flex-row">
            {/* Left-side (Logo Section) */}
            <section className="h-[50vh] lg:h-screen w-full lg:w-1/2 grid flex-grow place-items-center bg-primary">
                {/* <section className="h-[50vh] lg:h-screen w-full lg:w-1/2 card bg-base-300 rounded-box grid flex-grow place-items-center bg-custom-background"> */}
                <div className="flex flex-col justify-center items-center">
                    <Image
                        src="/cube.svg"
                        alt="Cube illustration"
                        width={75}
                        height={83}
                        className="w-20 h-20 sm:w-12 sm:h-12 lg:w-20 lg:h-20 pb-2"
                        priority
                    />
                    {/* <h1 className="text-2xl text-primary-foreground font-semibold">WebClicker++</h1> */}
                    <h1 className="text-[50px] leading-[60px] text-primary-foreground font-semibold">
                        WebClicker++
                    </h1>
                </div>
            </section>

            {/* Right-side (Google Sign-In) */}
            <section className="h-[50vh] lg:h-screen w-full lg:w-1/2 card bg-base-300 rounded-box grid flex-grow place-items-center">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-[40px] leading-[48px] font-normal text-[#434343] text-center">
                        Welcome to WebClicker++
                    </h1>

                    <div className="flex flex-col mt-11 items-center">
                        <AuthButton />
                        <p className="text-[19px] leading-[22.8px] text-[#434343] pt-6">
                            Don&apos;t have an account?{" "}
                            <button
                                className="text-[#092C4C] underline font-medium"
                                onClick={() => void signIn("google")}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </section>
            <div className="divider lg:divider-horizontal"></div>
        </div>
    );
}
