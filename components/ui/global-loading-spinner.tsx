"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function GlobalLoadingSpinner() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Add a small delay before showing the spinner to avoid flashing
    // for very quick navigations/auth checks
    const showDelay = 200; // ms
    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;
    
    // Start loading when path changes
    showTimeout = setTimeout(() => {
      setIsLoading(true);
    }, showDelay);
    
    // Set maximum loading time - hide after 2 seconds
    hideTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-sm font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}