"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

/**
 * Replaces the root layout when it fails, so it must ship its own <html> and
 * <body> and cannot rely on providers, fonts, or Tailwind tokens.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { where: "app/global-error", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F1E8",
          color: "#1C1B1A",
          fontFamily: "Inter, Arial, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "420px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#6B6762",
              margin: 0,
            }}
          >
            Wishly
          </p>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: "34px",
              lineHeight: 1.1,
              margin: "12px 0 0",
            }}
          >
            Something went sideways.
          </h1>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#6B6762",
              margin: "12px 0 0",
            }}
          >
            The page could not load. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "28px",
              minHeight: "48px",
              padding: "0 24px",
              borderRadius: "9999px",
              border: "none",
              background: "#E31C5F",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
