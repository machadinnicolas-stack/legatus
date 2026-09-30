import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Legatus — Mapa de Conquistas",
    short_name: "Legatus",
    description: "Comande suas conquistas com um plano realista.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f1eb",
    theme_color: "#11110f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
