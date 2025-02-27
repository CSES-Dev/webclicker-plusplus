'use client';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <div className="w-full  bg-custom-background text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="w-8 h-8">
          {/* Placeholder for menu icon or left element */}
        </div>
        
        <h1 className="text-2xl font-medium">Webclicker++</h1>
        
        <div className="w-8 h-8">
          {/* Hamburger menu icon */}
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}