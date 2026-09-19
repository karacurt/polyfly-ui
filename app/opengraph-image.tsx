import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(180deg, #0b1220 0%, #05080f 100%)",
          color: "#e8eef8",
        }}
      >
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#6ee7f5",
            marginBottom: 18,
          }}
        >
          Paper connectome
        </div>
        <div
          style={{
            fontSize: 84,
            fontFamily: "Georgia, serif",
            letterSpacing: -2,
          }}
        >
          Polyfly
        </div>
        <div style={{ fontSize: 26, color: "#8b97ad", marginTop: 16 }}>
          A living FlyWire-style connectome on Polygon.
        </div>
        <div style={{ fontSize: 20, color: "#8b97ad", marginTop: 28 }}>
          Decorative fly. Paper brain. Live wallet is display-only.
        </div>
      </div>
    ),
    { ...size },
  );
}
