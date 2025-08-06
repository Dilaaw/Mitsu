import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ResponseCompletedToastProps {
  message: string;
  toastId: string | number;
}

export function ResponseCompletedToast({
  message,
  toastId: _toastId,
}: ResponseCompletedToastProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg shadow-lg">
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your request has been completed successfully
        </p>
      </div>
    </div>
  );
}
