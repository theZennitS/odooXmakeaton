"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useBrightloop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
        let borderClass = "border-blue-200 bg-blue-50/90 text-blue-900";

        if (toast.type === "success") {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          borderClass = "border-emerald-200 bg-emerald-50/95 text-emerald-900";
        } else if (toast.type === "warning") {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
          borderClass = "border-amber-200 bg-amber-50/95 text-amber-900";
        } else if (toast.type === "error") {
          icon = <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
          borderClass = "border-red-200 bg-red-50/95 text-red-900";
        }

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg backdrop-blur-xs text-xs font-medium transition-all duration-200 animate-in slide-in-from-bottom-2",
              borderClass
            )}
          >
            <div className="flex items-center space-x-2.5 mr-2">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
