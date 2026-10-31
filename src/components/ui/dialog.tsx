import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-50 w-full max-w-lg p-0 bg-background rounded-xl border shadow-2xl animate-in zoom-in-95 duration-200 mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex items-center justify-between px-6 py-4 border-b bg-muted/20",
      className
    )}
    {...props}
  />
);

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn("text-lg font-semibold tracking-tight leading-none", className)}
    {...props}
  />
);

const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn("text-sm text-muted-foreground mt-1", className)}
    {...props}
  />
);

const DialogBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("p-6 overflow-y-auto space-y-4", className)}
    {...props}
  />
);

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex items-center justify-end space-x-2 px-6 py-4 border-t bg-muted/20",
      className
    )}
    {...props}
  />
);

export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
};
