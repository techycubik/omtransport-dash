import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

type ToastOptions = Omit<ToastProps, "id">

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { ...options, id }
      setToasts((prevToasts) => [...prevToasts, newToast])

      // Auto-remove toast after duration
      if (options.duration !== undefined) {
        setTimeout(() => {
          setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
        }, options.duration)
      }

      return id
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
} 