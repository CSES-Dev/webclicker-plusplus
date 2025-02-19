"use client";

import { X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Login from "@/app/Login/page";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        if (!session && pathname !== "/login") {
            toast({
                variant: "destructive",
                title: "Authentication required",
                description: "Please sign in to continue. Redirecting you to login page...",
            });
            // Add a small delay before redirecting to ensure the alert is visible
            const timeout = setTimeout(() => {
                router.push("/login");
            }, 2000);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [session, status, router]);

    // Show alert if there's no session
    if (!session) {
        return <Login />;
    }

    // If we have a session, render the children
    return <>{children}</>;
}
