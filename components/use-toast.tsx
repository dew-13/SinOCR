"use client"

import * as React from "react"

import type { ToastProps } from "@/components/ui/toast"

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

type ToastContextType = {
  toasts: ToastProps[]
  addToast: (toast: ToastProps) => void
  removeToast: (id: string) => void
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = (toast: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, toast])
  }

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>
}
