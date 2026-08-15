import { ImageResponse } from "next/og";
import { PROFILE, EXPERIENCE } from "@/lib/content";

export const alt = `${PROFILE.name} - ${PROFILE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * Drawn rather than shipped as a binary, so the card can never drift from the
 * content. It is the Motif desktop: steel-blue stipple, grey beveled window,
 * navy title bar, with the metrics from the current role.
 */
export default function OpengraphImage() {
  const metrics = EXPERIENCE[0].metrics.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4a6076",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 1000,
            background: "#d6d3ce",
            borderTop: "4px solid #ffffff",
            borderLeft: "4px solid #ffffff",
            borderRight: "4px solid #6e6b66",
            borderBottom: "4px solid #6e6b66",
            boxShadow: "8px 8px 0 rgba(0,0,0,0.3)",
          }}
        >
          {/* title bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#000080",
              color: "#ffffff",
              padding: "10px 14px",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            <span>resume.txt</span>
            <span style={{ display: "flex", gap: 8 }}>
              <span style={{ background: "#d6d3ce", color: "#000", padding: "0 8px" }}>_</span>
              <span style={{ background: "#d6d3ce", color: "#000", padding: "0 8px" }}>□</span>
              <span style={{ background: "#d6d3ce", color: "#000", padding: "0 8px" }}>×</span>
            </span>
          </div>

          {/* work area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              margin: 10,
              padding: "36px 40px 40px",
              background: "#ffffff",
              borderTop: "3px solid #6e6b66",
              borderLeft: "3px solid #6e6b66",
              borderRight: "3px solid #ffffff",
              borderBottom: "3px solid #ffffff",
            }}
          >
            <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#111111" }}>
              {PROFILE.name}
            </div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 30, color: "#444444" }}>
              {PROFILE.role} · CS + Economics @ UIUC
            </div>

            <div style={{ display: "flex", gap: 52, marginTop: 40 }}>
              {metrics.map((m) => (
                <div key={m.label} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 46, fontWeight: 700, color: "#000080" }}>{m.value}</span>
                  <span style={{ fontSize: 20, color: "#666666", marginTop: 4 }}>{m.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", marginTop: 40, fontSize: 22, color: "#777777" }}>
              shlokthakkar.com
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
