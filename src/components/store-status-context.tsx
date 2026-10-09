"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type StoreStatusContextType = {
  isStoreOpen: boolean;
  toggleStoreStatus: () => void;
  setStoreOpen: (open: boolean) => void;
};

const StoreStatusContext = createContext<StoreStatusContextType>({
  isStoreOpen: true,
  toggleStoreStatus: () => {},
  setStoreOpen: () => {},
});

export function StoreStatusProvider({ children }: { children: ReactNode }) {
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("veggieflick_store_status");
        if (saved !== null) {
          return saved === "open";
        }
      } catch {
        // Fallback
      }
    }
    return true;
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("store-offline", !isStoreOpen);
    }
  }, [isStoreOpen]);

  const toggleStoreStatus = () => {
    setIsStoreOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("veggieflick_store_status", next ? "open" : "closed");
      } catch {}
      if (typeof document !== "undefined") {
        document.body.classList.toggle("store-offline", !next);
      }
      return next;
    });
  };

  const setStoreOpen = (open: boolean) => {
    setIsStoreOpen(open);
    try {
      localStorage.setItem("veggieflick_store_status", open ? "open" : "closed");
    } catch {}
    if (typeof document !== "undefined") {
      document.body.classList.toggle("store-offline", !open);
    }
  };

  return (
    <StoreStatusContext.Provider value={{ isStoreOpen, toggleStoreStatus, setStoreOpen }}>
      {children}
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus() {
  return useContext(StoreStatusContext);
}
