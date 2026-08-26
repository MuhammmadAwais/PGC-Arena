"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to debounce any fast-changing value (e.g. search queries)
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 250ms)
 */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
