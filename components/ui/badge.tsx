import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary border border-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground border border-border/60",
        destructive:
          "border-transparent bg-destructive/10 text-destructive border border-destructive/20",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        purple:
          "border-transparent bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        outline: "text-foreground border border-border bg-card/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
