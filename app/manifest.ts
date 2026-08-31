import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Overload — gym tracker",
    short_name: "Overload",
    description:
      "Set logging, rest timers and progressive-overload tracking for the 12-week bulk block.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
  };
}
