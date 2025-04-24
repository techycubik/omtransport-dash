import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "destructive" | "outline" | "ghost" | "link"
}

export const buttonVariants = ({
  variant = "default",
  className,
}: {
  variant?: ButtonProps["variant"]
  className?: string
} = {}) => {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow": variant === "primary",
      "bg-slate-800 text-white hover:bg-slate-700": variant === "default",
      "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
      "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
      "text-indigo-600 underline-offset-4 hover:underline": variant === "link",
    },
    "h-10 px-4 py-2",
    className
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, className })}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button" 