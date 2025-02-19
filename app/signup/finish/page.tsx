"use client";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface APIResponse {
    error?: string;
}

export default function Name() {
    const router = useRouter();
    const { update } = useSession();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        router.push("/signup/role");
    };

    const handleGetStarted = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch("/api/updateFinishedOnboarding", {
                method: "PUT",
            });
            if (!response.ok) {
                const data = (await response.json()) as APIResponse;
                throw new Error(data.error ?? "Failed to update onboarding status");
            }
            await update();
            router.push("/dashboard");
        } catch (error: unknown) {
            console.error("Error updating user:", error);
            toast({
                variant: "destructive",
                description: error instanceof Error ? error.message : "An unexpected error occured",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <button
                onClick={handleBack}
                className="absolute top-8 left-8 flex items-center gap-2  outline outline-1 text-white bg-custom-background hover:bg-white hover:text-[#0029BD] outline-[#0029BD] transition-all p-2 rounded-lg px-4"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-lg">Back</span>
            </button>
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
                        className="hidden md:block lg:block outline outline-1 px-10 py-2 rounded-lg text-lg text-white  bg-custom-background outline-[#0029BD] hover:bg-white hover:text-[#0029BD] transition-all w-[204px] mx-auto"
                    >
                        {loading ? "..." : "Get Started"}
                    </button>
                    {/* Mobile button */}
                    <div className="block md:hidden lg:hidden text-center mt-8">
                        <button
                            onClick={() => void handleGetStarted()}
                            className="px-10 py-2 rounded-lg text-lg bg-custom-background text-white hover:bg-white hover:text-[#0029BD] outline outline-1 outline-[#0029BD] transition-all w-[204px]"
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
