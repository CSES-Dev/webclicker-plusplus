"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Login from "@/app/login/page";


export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            setShowAlert(true);
            // Add a small delay before redirecting to ensure the alert is visible
            const timeout = setTimeout(() => {
                router.push("/login");
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [session, status, router]);

    // Show alert if there's no session
    if (!session) {
        return (
            <div className="relative">
                {showAlert && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-white round rounded-lg">
                        <Alert variant="destructive">
                            <AlertDescription className="flex items-center justify-between">
                                Please sign in to continue
                                <button
                                    onClick={() => setShowAlert(false)}
                                    className="rounded-full p-1 hover:bg-red-100 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                <Login/>
            </div>
        );
    }

    // If we have a session, render the children
    return <>{children}</>;
}