import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://app.bananerahg.com";
  const routes = [
    "/",
    "/dashboard",
    "/analytics",
    "/analytics/predictivo",
    "/configuracion",
    "/configuracion/fincas",
    "/configuracion/usuarios",
    "/configuracion/permisos",
    "/geovisualizacion",
    "/inventario",
    "/inventario/insumos",
    "/inventario/movimientos",
    "/inventario/alertas",
    "/nomina",
    "/nomina/empleados",
    "/nomina/prestamos",
    "/nomina/roles",
    "/reportes",
    "/reportes/financiero",
    "/reportes/produccion",
  ];

  const exclude = ["/login", "/perfil"];
  const paths = routes.filter((p) => !exclude.includes(p));

  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/dashboard" ? 1 : 0.7,
  }));
}