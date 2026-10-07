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
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("veggieflick_store_status");
      if (saved !== null) {
        setIsStoreOpen(saved === "open");
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("veggieflick_store_status", isStoreOpen ? "open" : "closed");
    } catch {
      // Fallback
    }

    if (typeof document !== "undefined") {
      if (isStoreOpen) {
        document.body.classList.remove("store-offline");
      } else {
        document.body.classList.add("store-offline");
      }
    }
  }, [isStoreOpen, mounted]);

  const toggleStoreStatus = () => setIsStoreOpen((prev) => !prev);
  const setStoreOpen = (open: boolean) => setIsStoreOpen(open);

  return (
    <StoreStatusContext.Provider value={{ isStoreOpen, toggleStoreStatus, setStoreOpen }}>
      {children}
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus() {
  return useContext(StoreStatusContext);
}
