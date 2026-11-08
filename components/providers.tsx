"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { PhotoPreviewProvider } from "@/src/context/PhotoPreviewContext";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // A failed registration is not worth surfacing to the visitor.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const tree = (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <PhotoPreviewProvider>
        {children}
        <Toaster position="top-center" closeButton />
        <ServiceWorker />
      </PhotoPreviewProvider>
    </ThemeProvider>
  );

  if (!publishableKey) return tree;

  return <ClerkProvider publishableKey={publishableKey}>{tree}</ClerkProvider>;
}
