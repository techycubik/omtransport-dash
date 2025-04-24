"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  variant?: "default" | "success" | "warning" | "error" | "info"
}

export function Toast({ className, children, variant = "default", ...props }: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-6 pr-8 shadow-md transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full",
        {
          "border-[rgb(var(--border))] bg-white": variant === "default",
          "border-[rgb(var(--success-500))] bg-[rgb(var(--success-50))]": variant === "success",
          "border-[rgb(var(--yellow-500))] bg-[rgb(var(--yellow-50))]": variant === "warning",
          "border-[rgb(var(--error-500))] bg-[rgb(var(--error-50))]": variant === "error",
          "border-[rgb(var(--navy-300))] bg-[rgb(var(--navy-50))]": variant === "info",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {children}
    </div>
  )
}

export function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm font-bold text-[rgb(var(--navy-600))]", className)} {...props} />
}

export function ToastDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-[rgb(var(--steel-600))]", className)} {...props} />
}

export function ToastClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-[rgb(var(--steel-400))] opacity-0 transition-opacity hover:text-[rgb(var(--steel-600))] focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--navy-400))] group-hover:opacity-100",
        className
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  )
}

export function ToastViewport({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />
} 