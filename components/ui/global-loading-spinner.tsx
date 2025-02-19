"use client";

import { Loader2 } from "lucide-react";

export function GlobalLoadingSpinner() {
    return (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-sm font-medium text-gray-700">Loading...</p>
            </div>
        </div>
    );
}
