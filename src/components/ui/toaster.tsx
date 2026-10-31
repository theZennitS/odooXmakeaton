"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, removeToast } = useBrightloop();

  const getTitle = (type: "success" | "warning" | "info" | "error") => {
    switch (type) {
      case "success":
        return "Success";
      case "warning":
        return "Attention";
      case "error":
        return "Error";
      default:
        return "Notification";
    }
  };

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.type === "error" ? "destructive" : "default"}
          open={true}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id);
          }}
        >
          <div className="grid gap-1">
            <ToastTitle>{getTitle(toast.type)}</ToastTitle>
            <ToastDescription>{toast.message}</ToastDescription>
          </div>
          <ToastClose onClick={() => removeToast(toast.id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
