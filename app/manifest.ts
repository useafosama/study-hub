import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصة الچوو التعليمية | يوسف أسامة",
    short_name: "منصة الچوو",
    description: "منصة تعليمية خاصة للدراسة وتنظيم المحتوى والمحاضرات بإشراف يوسف أسامة",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    dir: "rtl",
    lang: "ar",
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
