"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";

// Hoisted constant to avoid recreating object each render
const EASING_MAP = {
  smooth: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  spring: [0.16, 1, 0.3, 1] as [number, number, number, number],
  "ease-out": [0, 0, 0.2, 1] as [number, number, number, number],
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
};

interface StaggeredSlideUpProps {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  distance?: number;
  maskHeight?: string;
  easing?: "smooth" | "spring" | "ease-out" | "bounce";
  viewport?: {
    once?: boolean;
    amount?: number;
    margin?: string;
  };
  threshold?: number;
  triggerOnce?: boolean;
  debug?: boolean;
}

const StaggeredSlideUp: React.FC<StaggeredSlideUpProps> = ({
  children,
  className = "",
  delay = 0.1,
  staggerDelay = 0.05,
  duration = 0.4,
  distance = 20,
  maskHeight = "120%",
  easing = "spring",
  viewport = { once: true, amount: 0.2, margin: "0px 0px -100px 0px" },
  threshold = 0.1,
  triggerOnce = false,
  debug = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
    margin: (viewport.margin as any) || "0px 0px -100px 0px",
  });
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && !hasTriggered) {
      setHasTriggered(true);
      if (debug) {
        console.log("StaggeredSlideUp: Animation triggered via useInView");
      }
    }
  }, [isInView, hasTriggered, debug]);

  useEffect(() => {
    if (!triggerOnce && !isInView) {
      setHasTriggered(false);
      if (debug) {
        console.log("StaggeredSlideUp: Animation reset");
      }
    }
  }, [isInView, triggerOnce, debug]);

  const memoizedContainerVariants = React.useMemo(
    () => ({
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          delay,
          staggerChildren: staggerDelay,
          delayChildren: delay,
          duration: 0.3,
          when: "beforeChildren" as const,
        },
      },
    }),
    [delay, staggerDelay]
  );

  const memoizedItemVariants = React.useMemo(
    () => ({
      hidden: { opacity: 0, y: distance, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration, ease: EASING_MAP[easing] },
      },
    }),
    [distance, duration, easing]
  );

  const memoizedMaskVariants = React.useMemo(
    () => ({
      hidden: { y: 0 },
      visible: {
        y: `-${maskHeight}`,
        transition: {
          duration: duration * 0.8,
          ease: EASING_MAP[easing],
          delay: 0.1,
        },
      },
    }),
    [maskHeight, duration, easing]
  );

  const shouldAnimate = hasTriggered || isInView;

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef || hasTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            setHasTriggered(true);
            if (debug) {
              console.log(
                "StaggeredSlideUp: Animation triggered via IntersectionObserver"
              );
            }
            if (triggerOnce) {
              observer.unobserve(currentRef);
            }
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: viewport.margin || "0px 0px -100px 0px",
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, viewport.margin, hasTriggered, triggerOnce, debug]);

  if (!Array.isArray(children) || children.length === 0) {
    if (debug) {
      console.warn("StaggeredSlideUp: No valid children provided");
    }
    // If a single child (ReactNode) was passed, still render container without map
    if (!Array.isArray(children) && children) {
      return (
        <motion.div
          ref={ref}
          className={`relative ${className}`}
          variants={memoizedContainerVariants}
          initial="hidden"
          animate={shouldAnimate ? "visible" : "hidden"}
          style={
            debug ? { border: "2px dashed red", padding: "4px" } : undefined
          }>
          <div className="relative overflow-hidden">
            <motion.div
              variants={memoizedItemVariants}
              className="relative z-10">
              {children}
            </motion.div>
            <motion.div
              variants={memoizedMaskVariants}
              className="absolute inset-0 z-20 pointer-events-none"
              style={{ height: maskHeight }}
            />
          </div>
        </motion.div>
      );
    }
    return <div className={className}></div>;
  }

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      variants={memoizedContainerVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      style={debug ? { border: "2px dashed red", padding: "4px" } : undefined}>
      {debug && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 z-50">
          InView: {isInView ? "Y" : "N"} | Triggered: {hasTriggered ? "Y" : "N"}
        </div>
      )}
      {children.map((child, index) => (
        <div key={index} className="relative overflow-hidden">
          <motion.div variants={memoizedItemVariants} className="relative z-10">
            {child}
          </motion.div>
          <motion.div
            variants={memoizedMaskVariants}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ height: maskHeight }}
          />
        </div>
      ))}
    </motion.div>
  );
};

export default StaggeredSlideUp;

/*
Example usage:
<StaggeredSlideUp
  delay={0.2}
  staggerDelay={0.15}
  duration={0.8}
  distance={80}
  maskHeight="150%"
  easing="spring"
  className="space-y-6"
  threshold={0.1}
  triggerOnce={true}
  debug={false}
  viewport={{
    once: true,
    amount: 0.2,
    margin: "0px 0px -100px 0px"
  }}
>
  {[
    <div key="1">First element to slide up</div>,
    <div key="2">Second element to slide up</div>,
    <div key="3">Third element to slide up</div>,
  ]}
</StaggeredSlideUp>

// For better performance on pages with many animations:
<StaggeredSlideUp
  threshold={0.05}
  triggerOnce={true}
  viewport={{
    margin: "0px 0px -50px 0px"
  }}
>
  {elements}
</StaggeredSlideUp>

// For debugging animation issues:
<StaggeredSlideUp
  debug={true}
  threshold={0.1}
  triggerOnce={false}
>
  {elements}
</StaggeredSlideUp>
*/
