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
        // Core variants (keeping these as they're likely used)
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // Project-specific variants (actively used in your code)
        red: "bg-brand-primary-2 text-brand-secondary-1 font-bold border border-transparent hover:bg-red-600 focus-visible:ring-red-500",
        redCta:
          "bg-brand-primary-2 text-brand-secondary-1 font-bold hover:bg-white hover:text-red-500 transition-colors duration-200",
        redOutline:
          "bg-transparent text-red-400 border border-red-400 hover:bg-brand-primary-2/10 transition-colors",
        close: "text-gray-500 hover:text-red-400 font-bold transition-colors",
        wizardOption:
          "bg-gray-900 border border-gray-800 text-gray-200 font-bold hover:bg-gray-900 hover:text-red-500 hover:border-red-600 data-[selected=true]:bg-brand-primary-2 data-[selected=true]:border-red-600 data-[selected=true]:text-brand-secondary-1 transition-colors",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-md",
        sm: "h-8 px-3 py-1.5 text-xs rounded-md",
        lg: "h-11 px-6 py-3 rounded-md",
        icon: "h-9 w-9 rounded-md",

        // Project-specific sizes
        red: "px-8 py-3 text-base rounded-md",
        cta: "px-8 py-3 text-sm rounded-md",
        back: "px-4 py-2 text-sm min-w-[108px] rounded-md",
        close: "w-auto h-auto p-0 text-3xl rounded-none",
        wizardOption: "px-6 py-3 text-xs h-12 w-full rounded-md border",
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
