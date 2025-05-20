import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function that merges tailwind classes with conditional classes combining functionalities of twMerge and clsx.
 *
 * @param inputs - Array of classnames/conditional classes.
 * @returns Merged className string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * A utility function that generates a greeting message.
 *
 * @param name - The name to greet.
 * @returns A greeting message.
 */
export function greetUser(name: string): string {
    return `Hello, ${name}! Welcome to our site.`;
}

/**
 * A utility function that replaces date objects time to 00:00:00 and returns ISO String.
 *
 * @param date - The name to greet.
 * @returns A greeting message.
 */
export function formatDateToISO(date: Date) {
    return new Date(date.setHours(0, 0, 0, 0)).toISOString();
}


export function shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
