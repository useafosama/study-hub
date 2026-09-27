import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95 border-t border-white/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95 border-t border-white/20",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted/80 hover:text-foreground shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-muted/70",
        link: "text-primary underline-offset-4 hover:underline",
        subtle: "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20",
      },
      size: {
        default: "h-10 px-4 py-2 text-xs sm:text-sm",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-sm sm:text-base font-bold",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
