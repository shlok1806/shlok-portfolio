import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** A terminal prompt on the Motif navy, drawn at build time. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000080",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "monospace",
        }}
      >
        &gt;_
      </div>
    ),
    size,
  );
}
