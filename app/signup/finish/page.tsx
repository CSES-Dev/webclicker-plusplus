"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

interface APIResponse {
    error?: string;
}

export default function Name() {
    const router = useRouter();
    const { update } = useSession();
    const [_error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGetStarted = async (): Promise<void> => {
        setError(null);
        setLoading(true);
        try {
            // 1. Make the POST request to your new route
            const response = await fetch("/api/updateFinishedOnboarding", {
                method: "PUT",
            });

            // 2. Check if the request was successful
            if (!response.ok) {
                // Extract the error message from the response, if any
                const data = (await response.json()) as APIResponse;
                throw new Error(data.error ?? "Failed to update onboarding status");
            }

            await update();
            // 3. On success, navigate to the dashboard
            router.push("/dashboard");
        } catch (err: unknown) {
            console.error("Error updating onboarding:", err);
            setError("An unexpected error occured");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Centered section with text and buttons */}
            <section className="flex justify-center pt-24">
                <div className="flex flex-col space-y-8 content-center justify-center gap-1">
                    {/* Heading */}
                    <p className="text-center text-3xl">
                        Thank you for joining
                        <br className="md:hidden" /> Webclicker++
                    </p>
                    {/* Desktop/tablet button */}
                    <button
                        onClick={() => void handleGetStarted()}
                        className="hidden md:block lg:block outline outline-1 px-10 py-2 rounded-lg text-lg text-white bg-custom-blue-background outline-[#0029BD] hover:bg-white hover:text-[#0029BD] transition-all w-[204px] mx-auto"
                    >
                        {loading ? "..." : "Get Started"}
                    </button>
                    {/* Mobile button */}
                    <div className="block md:hidden lg:hidden text-center mt-8">
                        <button
                            onClick={handleGetStarted}
                            className="px-10 py-2 rounded-lg text-lg bg-custom-blue-background text-white hover:bg-white hover:text-[#0029BD] outline outline-1 outline-[#0029BD] transition-all w-[204px]"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </section>
            {/* Logo container - visible on medium screens and larger */}
            <div className="bg-neutral hidden md:flex mt-18 items-center p-6 justify-center rounded-2xl">
                <Image
                    src="/webclickericon.svg"
                    alt="logo"
                    width={112} // equivalent to w-28 (28 * 4 = 112px)
                    height={112} // equivalent to h-28 (28 * 4 = 112px)
                    className="w-28 h-28"
                    priority
                />
            </div>
        </main>
    );
}
