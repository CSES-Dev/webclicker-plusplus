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
