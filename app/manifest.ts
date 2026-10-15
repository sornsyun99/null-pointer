import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Null Pointer — Daily AI & Tech Roasts", short_name: "Null Pointer", start_url: "/", display: "standalone",
    background_color: "#09090b", theme_color: "#09090b",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
