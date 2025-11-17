"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/src/contexts/app-context";
import type { PathOptions, Layer, Path } from "leaflet";

interface FeatureProperties {
  nombre: string;
  hectareas: number;
  rendimientoHa: number;
}

export function MiniMap() {
  const { fincas, cosechas } = useApp();

  const features = useMemo(() => {
    const latestByFinca = new Map<string, { cajas: number }>();
    for (const c of cosechas) {
      const prev = latestByFinca.get(c.finca);
      if (!prev || c.cajasProducidas >= prev.cajas) {
        latestByFinca.set(c.finca, { cajas: c.cajasProducidas });
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

  const style = (feature?: GeoJSON.Feature<GeoJSON.Geometry, FeatureProperties>) => {
    const r = feature?.properties?.rendimientoHa ?? 0;
    let fillColor = "#90CAF9"; // azul claro por defecto
    if (r >= 45) fillColor = "#1a5e20"; // verde fuerte
    else if (r >= 35) fillColor = "#2e7d32"; // verde
    else if (r >= 25) fillColor = "#fbc02d"; // amarillo

    return {
      color: "#2c3e50",
      weight: 1,
      fillColor,
      fillOpacity: 0.6,
    } as PathOptions;
  };

  const onEachFeature = (_feature: GeoJSON.Feature<GeoJSON.Geometry, FeatureProperties>, layer: Layer) => {
    // Popups opcionales, texto breve
    const p = _feature.properties;
    if (!p) return;
    const popupHtml = `<strong>${p.nombre}</strong><br/>${p.hectareas.toFixed(1)} ha`;
    (layer as Path).bindPopup(popupHtml);
  };

  const center: [number, number] = [-1.115, -79.445];

  return (
    <div className="w-full h-[240px] rounded-md overflow-hidden">
      <MapContainer center={center} zoom={12} style={{ width: "100%", height: "100%" }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {features.length > 0 && (
          <GeoJSON data={features as any} style={style} onEachFeature={onEachFeature} />
        )}
      </MapContainer>
    </div>
  );
}