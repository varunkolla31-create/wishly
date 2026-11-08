import { ImageResponse } from "next/og";

export const alt = "A locked gift box from Wishly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function WishOpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0B12",
          padding: 56,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            border: "2px solid rgba(214,194,131,0.38)",
            borderRadius: 36,
            padding: 56,
            background:
              "linear-gradient(135deg, #17121A 0%, #0D0B12 58%, #1A120B 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 620,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 24,
                letterSpacing: 7,
                color: "#D6C283",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 9999,
                  background: "#FF385C",
                }}
              />
              WISHLY
            </div>

            <div
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: 66,
                lineHeight: 1.04,
                color: "#FFF8EC",
                maxWidth: 600,
              }}
            >
              Someone sent you a surprise.
            </div>

            <div
              style={{
                fontSize: 28,
                lineHeight: 1.4,
                color: "rgba(255,248,236,0.7)",
                maxWidth: 560,
              }}
            >
              A private, password-protected memory reel is waiting. Tap to
              unlock.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
                fontSize: 20,
                letterSpacing: 3,
                color: "#D6C283",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 20,
                    border: "4px solid #D6C283",
                    borderBottom: "none",
                    borderRadius: "13px 13px 0 0",
                  }}
                />
                <div
                  style={{
                    width: 40,
                    height: 30,
                    borderRadius: 6,
                    background: "#D6C283",
                  }}
                />
              </div>
              PASSWORD PROTECTED
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 420,
              height: 420,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 20,
                width: 280,
                height: 220,
                borderRadius: 24,
                background: "linear-gradient(180deg, #FF385C 0%, #B8283E 100%)",
                boxShadow: "0 34px 70px rgba(0,0,0,0.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 208,
                width: 320,
                height: 66,
                borderRadius: 16,
                background: "linear-gradient(180deg, #D9465F 0%, #A51444 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 20,
                width: 46,
                height: 254,
                background: "#D6C283",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 208,
                width: 320,
                height: 26,
                background: "#D6C283",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 262,
                left: 66,
                width: 74,
                height: 74,
                border: "15px solid #D6C283",
                borderRadius: 9999,
                transform: "rotate(-24deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 262,
                right: 66,
                width: 74,
                height: 74,
                border: "15px solid #D6C283",
                borderRadius: 9999,
                transform: "rotate(24deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 282,
                width: 56,
                height: 56,
                borderRadius: 9999,
                background: "#D6C283",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 36,
                  border: "8px solid #FFF8EC",
                  borderBottom: "none",
                  borderRadius: "20px 20px 0 0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 82,
                  height: 64,
                  borderRadius: 14,
                  background: "#FFF8EC",
                  color: "#0D0B12",
                  fontSize: 28,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    background: "#0D0B12",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
