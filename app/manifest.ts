import type { MetadataRoute } from "next";
import { OS, PROFILE } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${OS.name} - ${PROFILE.name}`,
    short_name: OS.name,
    description: `${PROFILE.name}, ${PROFILE.role}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#4a6076",
    theme_color: "#4a6076",
    icons: [{ src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}
