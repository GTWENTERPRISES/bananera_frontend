"use client";

import { useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/src/contexts/app-context";
import type { Finca } from "@/src/lib/types";
import type { PathOptions, Layer, Path } from "leaflet";

interface FeatureProperties {
  nombre: string;
  hectareas: number;
  rendimientoHa: number;
}

function getCentroid(geom: any): [number, number] | null {
  if (!geom) return null;
  const type = geom?.type;
  const coords = geom?.coordinates;
  let ring: number[][] | null = null;
  if (type === "Polygon" && Array.isArray(coords) && coords.length > 0) {
    ring = coords[0];
  } else if (
    type === "MultiPolygon" &&
    Array.isArray(coords) &&
    coords.length > 0
  ) {
    ring = coords[0]?.[0] ?? null;
  }
  if (!ring || ring.length === 0) return null;
  let sumLon = 0;
  let sumLat = 0;
  for (const [lon, lat] of ring) {
    sumLon += lon;
    sumLat += lat;
  }
  const lonAvg = sumLon / ring.length;
  const latAvg = sumLat / ring.length;
  return [latAvg, lonAvg];
}

export function MapGeneral() {
  const { fincas, cosechas, empleados, insumos } = useApp();

  const fincaLinks: Record<string, string> = {
    BABY: "https://maps.app.goo.gl/oBSwV5z1GYJTL2HH8",
    SOLO: "https://maps.app.goo.gl/b3WkLYpdYUot6fYGA",
    LAURITA: "https://maps.app.goo.gl/S9crU6ZatQ9vAJPu8",
    MARAVILLA: "https://maps.app.goo.gl/aJwCkTjyoKknvmUy7",
  };

  const features = useMemo(() => {
    // Determinar la última semana por finca para calcular rendimiento
    const latestByFinca = new Map<string, { cajas: number }>();
    for (const c of cosechas) {
      // Tomar la última cosecha registrada por finca (por simplicidad)
      const prev = latestByFinca.get(c.finca);
      if (!prev) {
        latestByFinca.set(c.finca, { cajas: c.cajasProducidas });
      } else {
        // Mantener el mayor número de cajas como proxy de la última (mock data con una semana)
        if (c.cajasProducidas >= prev.cajas) {
          latestByFinca.set(c.finca, { cajas: c.cajasProducidas });
        }
      }
    }

    const feats: GeoJSON.Feature<GeoJSON.Geometry, FeatureProperties>[] = [];
    for (const f of fincas) {
      if (!f.geom) continue;
      const cajas = latestByFinca.get(f.nombre)?.cajas ?? 0;
      const rendimientoHa = f.hectareas ? cajas / f.hectareas : 0;
      feats.push({
        type: "Feature",
        geometry: f.geom as unknown as GeoJSON.Geometry,
        properties: {
          nombre: f.nombre,
          hectareas: f.hectareas,
          rendimientoHa,
        },
      });
    }
    return feats;
  }, [fincas, cosechas]);

  // Cálculo de centroides y cuadrillas activas (Enfunde) por finca
  const crewMarkers = useMemo(() => {
    return fincas
      .filter((f) => !!f.geom)
      .map((f) => {
        const centroid = getCentroid(f.geom);
        const activosEnfunde = empleados.filter(
          (e) => e.activo && e.labor === "Enfunde" && e.finca === f.nombre
        ).length;
        return centroid
          ? {
              finca: f.nombre,
              position: centroid as [number, number],
              count: activosEnfunde,
            }
          : null;
      })
      .filter(Boolean) as {
      finca: string;
      position: [number, number];
      count: number;
    }[];
  }, [fincas, empleados]);

  // Marcadores de bodegas (mock) y estado de inventario (stock bajo)
  const bodegaMarkers = useMemo(() => {
    const stockBajo = insumos.filter(
      (i) => i.stockActual < i.stockMinimo
    ).length;
    // Ubicar bodegas cerca de los centroides de fincas
    const bases = fincas
      .filter((f) => !!f.geom)
      .slice(0, 4)
      .map((f) => {
        const centroid = getCentroid(f.geom);
        if (!centroid) return null;
        const [lat, lng] = centroid;
        return [lat + 0.002, lng + 0.002] as [number, number];
      })
      .filter(Boolean) as [number, number][];
    const nombres = [
      "Bodega Central",
      "Bodega Norte",
      "Bodega Sur",
      "Bodega Este",
    ];
    return bases.map((p, i) => ({
      nombre: nombres[i] || `Bodega ${i + 1}`,
      position: p,
      stockBajo,
    }));
  }, [insumos, fincas]);

  const style = (
    feature?: GeoJSON.Feature<GeoJSON.Geometry, FeatureProperties>
  ) => {
    const r = feature?.properties?.rendimientoHa ?? 0;
    let fillColor = "#e53935"; // rojo
    if (r >= 45) fillColor = "#1a5e20"; // verde fuerte
    else if (r >= 35) fillColor = "#2e7d32"; // verde
    else if (r >= 25) fillColor = "#fbc02d"; // amarillo

    return {
      color: "#1a5e20",
      weight: 1.2,
      fillColor,
      fillOpacity: 0.5,
    } as PathOptions;
  };

  const onEachFeature = (
    feature: GeoJSON.Feature<GeoJSON.Geometry, FeatureProperties>,
    layer: Layer
  ) => {
    const p = feature.properties;
    if (!p) return;
    const url = fincaLinks[p.nombre] || "";
    const popupHtml = `<div style=\"min-width:180px\">\n      <strong>${
      p.nombre
    }</strong><br/>\n      Hectáreas: ${p.hectareas.toFixed(
      1
    )}<br/>\n      Cajas/ha (semana): ${p.rendimientoHa.toFixed(
      1
    )}<br/>\n      <a href='${url}' target='_blank' rel='noopener noreferrer'>Abrir en Maps</a>\n    </div>`;
    (layer as Path).bindPopup(popupHtml);
  };

  // Calcular centro promedio dinámico para inicializar
  const center: [number, number] = useMemo(() => {
    const pts: [number, number][] = [];
    for (const f of fincas) {
      const c = getCentroid(f.geom);
      if (c) pts.push(c);
    }
    if (pts.length === 0) return [-1.007, -79.353];
    const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return [lat, lng];
  }, [fincas]);

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] rounded-md overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%", minHeight: "420px" }}
        scrollWheelZoom
        zoomControl={false}
      >
        <MapAutoResize />
        <MapSizeObserver />
        <FitToFeatures features={features} />
        <ZoomControl position="topright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {features.length > 0 && (
          <GeoJSON
            data={features as any}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
        {crewMarkers.map((m) => (
          <CircleMarker
            key={`crew-${m.finca}`}
            center={m.position}
            radius={6}
            pathOptions={{
              color: m.count > 0 ? "#1976d2" : "#9e9e9e",
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{m.finca}</div>
                <div>Cuadrillas activas (Enfunde): {m.count}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {bodegaMarkers.map((b) => (
          <CircleMarker
            key={`bodega-${b.nombre}`}
            center={b.position}
            radius={7}
            pathOptions={{
              color: b.stockBajo > 0 ? "#d32f2f" : "#2e7d32",
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{b.nombre}</div>
                <div>Insumos con stock bajo: {b.stockBajo}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {/* Leyenda choropleth */}
    </div>
  );
}

// Agrega un manejador para recalcular el tamaño del mapa al montarse y al redimensionar la ventana
function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 150);
    const onResize = () => {
      try {
        map.invalidateSize();
      } catch {}
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

function FitToFeatures({
  features,
}: {
  features: GeoJSON.Feature<GeoJSON.Geometry, any>[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!features || features.length === 0) return;
    const bounds: [number, number][] = [];
    features.forEach((feat) => {
      const g: any = feat.geometry;
      const type = g?.type;
      const coords = g?.coordinates;
      let ring: number[][] | null = null;
      if (type === "Polygon" && Array.isArray(coords)) ring = coords[0];
      else if (type === "MultiPolygon" && Array.isArray(coords))
        ring = coords[0]?.[0] ?? null;
      if (!ring) return;
      ring.forEach(([lng, lat]) => bounds.push([lat, lng]));
    });
    if (bounds.length) {
      try {
        (map as any).fitBounds(bounds, { padding: [20, 20] });
      } catch {}
    }
  }, [features, map]);
  return null;
}

function MapSizeObserver() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    let rafId: number | null = null;
    const invalidate = () => {
      if (rafId) cancelAnimationFrame(rafId as number);
      rafId = requestAnimationFrame(() => {
        try {
          map.invalidateSize();
        } catch {}
      });
    };
    const ResizeObserverCtor = (window as any).ResizeObserver;
    const observer = ResizeObserverCtor
      ? new ResizeObserverCtor((entries: any[]) => {
          if (!entries || entries.length === 0) return;
          invalidate();
        })
      : null;
    if (observer && container) observer.observe(container);
    return () => {
      if (observer && container) observer.unobserve(container);
      if (rafId) cancelAnimationFrame(rafId as number);
    };
  }, [map]);
  return null;
}
