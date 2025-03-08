"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export default function AuthButton() {
    const { toast } = useToast();

    const handleSignIn = async () => {
        try {
            await signIn("google", {
                callbackUrl: "/signup/name",
            });
        } catch (error) {
            toast({ variant: "destructive", description: "Error signing in!" });
            console.error("Sign in error:", error);
        }
    };

    return (
        <button
            onClick={() => void handleSignIn()}
            className="bg-[#092C4C] text-white w-[329px] h-[67px] px-[55px] py-[17px] rounded-[10px] flex items-center justify-center text-lg font-medium"
        >
            <Image
                src="/googlebutton.svg"
                alt="Google Logo"
                width={24}
                height={24}
                className="mr-3"
            />
            Sign in with Google
        </button>
    );
}
