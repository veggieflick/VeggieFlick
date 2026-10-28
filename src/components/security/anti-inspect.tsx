"use client";

import { useEffect } from "react";

/**
 * AntiInspect Security Component
 * - Disables F12 key (DevTools)
 * - Disables Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect/Console shortcuts)
 * - Disables Ctrl+U (View Source)
 * - Disables Right-Click Context Menu (Inspect Element protection)
 * - Suppresses console output in production to prevent leaking sensitive API information
 */
export function AntiInspect() {
  useEffect(() => {
    // 1. Suppress console methods in client browser
    if (typeof window !== "undefined") {
      const isProd = process.env.NODE_ENV === "production";
      if (isProd) {
        try {
          const noop = () => {};
          // Overwrite sensitive console logs
          window.console.log = noop;
          window.console.info = noop;
          window.console.debug = noop;
          window.console.warn = noop;
        } catch {
          // ignore
        }
      }
    }

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    function handleKeyDown(event: KeyboardEvent) {
      // F12 key
      if (event.key === "F12" || event.keyCode === 123) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspect)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (event.key === "I" || event.key === "i" || event.keyCode === 73)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (event.key === "J" || event.key === "j" || event.keyCode === 74)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (event.key === "C" || event.key === "c" || event.keyCode === 67)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+U (View Source)
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "U" || event.key === "u" || event.keyCode === 85)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page HTML)
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "S" || event.key === "s" || event.keyCode === 83)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }

    // 3. Disable Right-Click Context Menu to prevent "Inspect Element"
    function handleContextMenu(event: MouseEvent) {
      // Allow context menu only on standard input/textarea for copy-pasting
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    // 4. DevTools Detection & Anti-Debugger protection
    let devtoolsInterval: NodeJS.Timeout | null = null;
    if (process.env.NODE_ENV === "production") {
      devtoolsInterval = setInterval(() => {
        const widthDiff = window.outerWidth - window.innerWidth > 160;
        const heightDiff = window.outerHeight - window.innerHeight > 160;
        if (widthDiff || heightDiff) {
          try {
            console.clear();
          } catch {}
        }
      }, 1000);
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      if (devtoolsInterval) clearInterval(devtoolsInterval);
    };
  }, []);

  return null;
}
