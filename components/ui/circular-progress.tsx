"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function CircularProgress({
  value,
  size = 160,
  thickness = 12,
  className,
}: {
  value: number;
  size?: number;
  thickness?: number;
  className?: string;
}) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg className="absolute" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={value > 0 ? "#E6F6EC" : "#E5E7EB"}
          strokeWidth={thickness}
          className="transition-colors duration-300"
        />
      </svg>

      <svg className="absolute" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#2D9B62"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-300"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-normal text-muted-foreground">
          Class Average:
        </span>
        <span className="text-3xl font-medium text-foreground">
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
}
