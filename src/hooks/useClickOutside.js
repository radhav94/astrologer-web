import { useEffect, useRef } from "react";

/**
 * Hook that calls a handler when a click occurs outside the referenced element.
 * Only attaches the listener when `isActive` is true (defaults to true).
 */
export default function useClickOutside(handler, isActive = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler, isActive]);

  return ref;
}
