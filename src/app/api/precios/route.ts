import { NextRequest } from "next/server";

type PrecioRegistro = { date: string; price: number };
type PrecioMes = { mes: string; precio: number };

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// Fallback local en caso de no tener proveedor externo configurado
const fallbackPrecios: PrecioMes[] = [
  { mes: "Ene", precio: 6.2 },
  { mes: "Feb", precio: 6.5 },
  { mes: "Mar", precio: 6.8 },
  { mes: "Abr", precio: 7.0 },
  { mes: "May", precio: 7.2 },
  { mes: "Jun", precio: 7.1 },
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const commodity = url.searchParams.get("commodity") || "banana";
  const currency = url.searchParams.get("currency") || "USD";
  const unit = url.searchParams.get("unit") || "caja";
  const range = url.searchParams.get("range") || "6m"; // 6 meses
  const market = url.searchParams.get("market") || "EC";

  const endpoint = process.env.MARKET_PRICE_ENDPOINT;
  const apiKey = process.env.MARKET_PRICE_API_KEY;

  // Si no hay endpoint, devolvemos fallback inmediato
  if (!endpoint) {
    return new Response(JSON.stringify({ source: "fallback", data: fallbackPrecios }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  try {
    const params = new URLSearchParams({ commodity, currency, unit, range, market });
    const fetchUrl = `${endpoint}?${params.toString()}`;

    const res = await fetch(fetchUrl, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
      // Evita cache agresivo de proxy
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Proveedor respondió ${res.status}`);
    }

    const json = (await res.json()) as { data?: PrecioRegistro[] } | PrecioRegistro[];
    const registros: PrecioRegistro[] = Array.isArray(json) ? json : json.data || [];

    // Normaliza a formato mensual `{ mes, precio }`
    const datos: PrecioMes[] = registros.map((r) => {
      const d = new Date(r.date);
      const mes = MESES[d.getUTCMonth()] || "";
      return { mes, precio: Number(r.price) };
    });

    // Si proveedor devuelve vacío, usar fallback para no romper UI
    const payload = datos.length > 0 ? datos : fallbackPrecios;

    return new Response(JSON.stringify({ source: "provider", data: payload }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error obteniendo precios de mercado:", err);
    return new Response(JSON.stringify({ source: "error", data: fallbackPrecios }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }
}