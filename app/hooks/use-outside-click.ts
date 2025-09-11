import React, { useEffect } from "react";

// Accept both RefObject and MutableRefObject shapes
export type AnyRef<T extends HTMLElement = HTMLElement> = { current: T | null };

export type OutsideClickHandler = (
  event: MouseEvent | TouchEvent
) => void;

/**
 * useOutsideClick
 * Calls `callback` when a mousedown or touchstart occurs outside the provided ref element.
 */
export const useOutsideClick = <T extends HTMLElement = HTMLElement>(
  ref: AnyRef<T>,
  callback: OutsideClickHandler
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      const target = event.target as Node | null;
      if (target && el.contains(target)) return;
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
