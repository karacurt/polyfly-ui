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
          background: "#060709",
          color: "#f3f4ed",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: "#060709",
            background: "#bdff32",
            padding: "8px 16px",
            width: 140,
            marginBottom: 28,
          }}
        >
          PAPER
        </div>
        <div style={{ fontSize: 72, letterSpacing: -2 }}>POLYFLY</div>
        <div style={{ fontSize: 28, color: "#989aaa", marginTop: 12 }}>
          // NEURAL TRADING
        </div>
        <div style={{ fontSize: 20, color: "#989aaa", marginTop: 36 }}>
          MaleCNS paper trader no Polymarket. Sem ordens reais.
        </div>
      </div>
    ),
    { ...size },
  );
}
