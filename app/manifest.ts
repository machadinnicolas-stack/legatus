import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fôlego — Suas parcelas sob controle",
    short_name: "Fôlego",
    description: "Veja quanto do seu salário já está comprometido e quando seu dinheiro volta a respirar.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f3ef",
    theme_color: "#171a19",
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
