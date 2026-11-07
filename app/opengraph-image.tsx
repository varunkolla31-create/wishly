import { ImageResponse } from "next/og";

export const alt = "Wishly — a wish they can unlock";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F1E8",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#6B6762",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 9999,
              background: "#FF385C",
            }}
          />
          wishly
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 84,
              lineHeight: 1.02,
              color: "#1C1B1A",
              maxWidth: 940,
            }}
          >
            A wish they can unlock.
          </div>
          <div style={{ fontSize: 30, color: "#6B6762", maxWidth: 760 }}>
            Password-protected wish pages for the days that matter.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
