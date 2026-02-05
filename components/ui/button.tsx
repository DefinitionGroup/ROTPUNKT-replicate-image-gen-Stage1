"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, type MotionProps } from "motion/react";

const buttonVariants = cva(
  // Base styles - common to all buttons
  "inline-flex items-center cursor-pointer  justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 backdrop-blur-sm transition-all duration-300",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",

        // Project-specific variants
        red: "bg-brand-primary-2 text-white shadow-lg shadow-brand-primary-2/20 hover:shadow-brand-primary-2/40 hover:bg-red-600 border border-transparent transition-all duration-300 scale-100 hover:scale-[1.02]",
        redCta:
          "bg-brand-primary-2 text-white font-bold tracking-wide shadow-lg shadow-brand-primary-2/25 hover:bg-red-600 hover:shadow-brand-primary-2/50 transition-all duration-300",
        redOutline:
          "bg-transparent text-brand-primary-2 border border-brand-primary-2/50 hover:bg-brand-primary-2/10 hover:border-brand-primary-2 transition-all duration-300",
        close: "text-muted-foreground hover:text-foreground transition-colors duration-200",
        wizardOption:
          "bg-muted/70 border border-border text-muted-foreground font-medium hover:bg-muted hover:text-foreground hover:border-border/70 data-[selected=true]:bg-brand-primary-2 data-[selected=true]:border-brand-primary-2 data-[selected=true]:text-white transition-all duration-300 shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-full",
        sm: "h-8 px-4 py-1.5 text-xs rounded-full",
        lg: "h-12 px-8 py-3 rounded-full text-base",
        icon: "h-10 w-10 rounded-full",

        // Project-specific sizes
        red: "px-8 py-3 text-base rounded-full",
        cta: "px-10 py-4 text-base rounded-full", 
        back: "px-6 py-2 text-sm min-w-[120px] rounded-full",
        close: "w-10 h-10 p-0 text-2xl rounded-full flex items-center justify-center",
        wizardOption: "px-6 py-4 text-sm h-auto w-full rounded-xl border",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    enableMotion?: boolean;
  } & MotionProps;

function Button({
  className,
  variant,
  size,
  asChild = false,
  enableMotion = false,
  initial,
  animate,
  transition,
  whileHover,
  whileTap,
  style,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  // Check if motion should be enabled
  const hasMotionProps =
    enableMotion ||
    initial !== undefined ||
    animate !== undefined ||
    transition !== undefined ||
    whileHover !== undefined ||
    whileTap !== undefined;

  // Default motion animations
  const motionDefaults = hasMotionProps
    ? {
      initial: initial ?? { opacity: 0, scale: 0.95 },
      animate: animate ?? { opacity: 1, scale: 1 },
      transition: transition ?? {
        type: "spring",
        stiffness: 200,
        damping: 13,
      },
      whileHover: whileHover ?? { scale: 1.05 },
      whileTap: whileTap ?? { scale: 0.98 },
    }
    : {};

  // Motion-optimized styles
  const motionStyle = hasMotionProps
    ? {
      transformOrigin: "center" as const,
      backfaceVisibility: "hidden" as const,
      willChange: "transform, opacity" as const,
      ...(style as React.CSSProperties),
    }
    : style;

  const safeClassName = hasMotionProps
    ? cn(buttonVariants({ variant, size }), className).replace(
      /transition-\w+/g,
      ""
    )
    : cn(buttonVariants({ variant, size }), className);

  if (hasMotionProps) {
    const MotionComp = motion(Comp);
    return (
      <MotionComp
        className={safeClassName}
        style={motionStyle}
        {...motionDefaults}
        {...props}
      />
    );
  }

  return <Comp className={safeClassName} style={motionStyle} {...props} />;
}

export { Button, buttonVariants };
