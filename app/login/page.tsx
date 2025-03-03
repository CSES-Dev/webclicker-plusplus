"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import AuthButton from "@/components/auth-button";

export default function Login() {
    return (
        <div className="flex w-full flex-col lg:flex-row">
            {/* Left-side (Logo Section) */}
            <section className="h-[50vh] lg:h-screen w-full lg:w-1/2 card bg-base-300 rounded-box grid flex-grow place-items-center bg-custom-background">
                <div className="flex flex-col justify-center items-center">
                    <Image
                        src="/cube.svg"
                        alt="Cube illustration"
                        width={80}
                        height={80}
                        className="w-20 h-20 sm:w-12 sm:h-12 lg:w-20 lg:h-20 pb-2"
                        priority
                    />
                    <h1 className="text-2xl text-primary-foreground font-semibold">WebClicker++</h1>
                </div>
            </section>

            {/* Right-side (Google Sign-In) */}
            <section className="h-[50vh] lg:h-screen w-full lg:w-1/2 card bg-base-300 rounded-box grid flex-grow place-items-center">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-3xl text-primary-foreground font-sans text-slate-700">
                        Welcome to WebClicker++
                    </h1>

                    <div className="flex flex-col mt-11 items-center">
                        <AuthButton />
                        <p className="text-gray-500 pt-6 text-sm">
                            Don&apos;t have an account?{" "}
                            <button
                                className="text-blue-700 underline"
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
