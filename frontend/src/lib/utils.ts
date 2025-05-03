import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to convert RGB CSS variable to a CSS color value
 * @param variable CSS variable name without 'var(--' prefix and ')' suffix
 * @param opacity Optional opacity value between 0 and 1
 */
export function rgbVar(variable: string, opacity?: number) {
  if (opacity !== undefined) {
    return `rgba(var(--${variable}), ${opacity})`;
  }
  return `rgb(var(--${variable}))`;
} 