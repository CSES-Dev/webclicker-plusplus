"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Login from "@/app/login/page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    
    useEffect(() => {
        if (status === "loading") return;
        
        if (!session) {
            setShowAlert(true);
            router.push("/login");
        } else {
            setLoading(false);
        }
    }, [session, status, router]);

    if (loading) {
        return (
            <div className="relative">
                {showAlert && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-white round rounded-lg">
                        <Alert variant="destructive">
                            <AlertDescription className="flex items-center justify-between">
                                Please sign in to continue
                                <button 
                                    onClick={() => setShowAlert(false)}
                                    className=" round rounded-full "
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                <Login />
            </div>
        );
    }

    return <>{children}</>;
}