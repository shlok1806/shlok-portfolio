import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The same prompt as the favicon, at the size a home screen wants. */
export default function AppleIcon() {
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
          fontSize: 104,
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
