"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function GlobalLoadingSpinner() {
    // Track navigation loading separately from session
    const [isNavigating, setIsNavigating] = useState(false);
    const { status } = useSession();

    // Force reset after fixed timeout to prevent getting stuck
    useEffect(() => {
        // Show spinner on first mount
        setIsNavigating(true);

        // Force hide spinner after max 5 seconds regardless of state
        // This prevents it from getting permanently stuck
        const forceResetTimeout = setTimeout(() => {
            setIsNavigating(false);
        }, 5000);

        // Hide spinner after initial load
        const initialLoadTimeout = setTimeout(() => {
            setIsNavigating(false);
        }, 1000);

        return () => {
            clearTimeout(forceResetTimeout);
            clearTimeout(initialLoadTimeout);
        };
    }, []);
    const shouldShow = status === "loading" || isNavigating;
    if (!shouldShow) return null;

    return (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-sm font-medium text-gray-700">Loading...</p>
            </div>
        </div>
    );
}
