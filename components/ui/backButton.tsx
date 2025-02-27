'use client';
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
}

export default function BackButton({ href = "/", onClick }: BackButtonProps) {
  const buttonContent = (
    <div className="flex items-center px-5 py-1  bg-custom-background text-white rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      <span className="text-lg font-medium">Back</span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="inline-block">
        {buttonContent}
      </button>
    );
  }

  return (
    <Link href={href} className="inline-block">
      {buttonContent}
    </Link>
  );
}