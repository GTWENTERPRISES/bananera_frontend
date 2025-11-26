import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://app.bananerahg.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/dashboard",
          "/analytics",
          "/configuracion",
          "/geovisualizacion",
          "/inventario",
          "/nomina",
          "/reportes",
        ],
        disallow: ["/login", "/perfil"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}