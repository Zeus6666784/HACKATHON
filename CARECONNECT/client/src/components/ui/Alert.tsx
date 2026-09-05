import * as React from "react";
import { cn } from "../../lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-white text-slate-950 border-slate-200",
    destructive: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";
