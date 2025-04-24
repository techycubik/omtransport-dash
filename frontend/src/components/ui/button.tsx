import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "destructive" | "outline" | "ghost" | "link" | "success" | "warning"
  size?: "sm" | "md" | "lg" | "icon"
  isLoading?: boolean
}

export const buttonVariants = ({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  className?: string
} = {}) => {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      // Variant styles
      "bg-[rgb(var(--primary-600))] text-white hover:bg-[rgb(var(--primary-700))] focus-visible:ring-[rgb(var(--primary-600))]": 
        variant === "primary",
      "bg-[rgb(var(--neutral-900))] text-white hover:bg-[rgb(var(--neutral-800))] focus-visible:ring-[rgb(var(--neutral-900))]": 
        variant === "default",
      "bg-[rgb(var(--error-500))] text-white hover:bg-[rgb(var(--error-600))] focus-visible:ring-[rgb(var(--error-500))]": 
        variant === "destructive",
      "bg-[rgb(var(--success-500))] text-white hover:bg-[rgb(var(--success-600))] focus-visible:ring-[rgb(var(--success-500))]": 
        variant === "success",
      "bg-[rgb(var(--warning-500))] text-white hover:bg-[rgb(var(--warning-600))] focus-visible:ring-[rgb(var(--warning-500))]": 
        variant === "warning",
      "border border-[rgb(var(--border))] bg-transparent hover:bg-[rgb(var(--neutral-100))] focus-visible:ring-[rgb(var(--neutral-400))]": 
        variant === "outline",
      "bg-transparent hover:bg-[rgb(var(--neutral-100))] focus-visible:ring-[rgb(var(--neutral-400))]": 
        variant === "ghost",
      "text-[rgb(var(--primary-600))] underline-offset-4 hover:underline focus-visible:ring-[rgb(var(--primary-600))]": 
        variant === "link",
    },
    {
      // Size styles
      "text-xs px-2.5 py-1 h-7 rounded": size === "sm",
      "text-sm px-4 py-2 h-10": size === "md",
      "text-base px-6 py-2.5 h-12": size === "lg",
      "p-2 w-10 h-10": size === "icon",
    },
    className
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button" 