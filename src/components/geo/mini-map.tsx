"use client";

import { useMemo, useEffect, useRef } from "react";
import { useApp } from "@/src/contexts/app-context";

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
  } else if (type === "MultiPolygon" && Array.isArray(coords) && coords.length > 0) {
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

export function MiniMap() {
  const { fincas, cosechas } = useApp();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const features = useMemo(() => {
    const latestByFinca = new Map<string, { cajas: number }>();
    for (const c of cosechas) {
      const prev = latestByFinca.get(c.finca);
      if (!prev || c.cajasProducidas >= prev.cajas) {
        latestByFinca.set(c.finca, { cajas: c.cajasProducidas });
      }
    }
    const feats: any[] = [];
    for (const f of fincas) {
      if (!f.geom) continue;
      const cajas = latestByFinca.get(f.nombre)?.cajas ?? 0;
      const rendimientoHa = f.hectareas ? cajas / f.hectareas : 0;
      feats.push({
        type: "Feature",
        geometry: f.geom as any,
        properties: { nombre: f.nombre, hectareas: f.hectareas, rendimientoHa },
      });
    }
    return feats;
  }, [fincas, cosechas]);

  const featureCollection = useMemo(() => ({ type: "FeatureCollection", features }), [features]);
  const lotFeatures = useMemo(() => {
    const feats: any[] = [];
    fincas.forEach((f) => {
      if (!f.lotes) return;
      Object.entries(f.lotes).forEach(([lote, pos]) => {
        const p: any = pos;
        if (!p) return;
        feats.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
          properties: { finca: f.nombre, lote },
        });
      });
    });
    return { type: 'FeatureCollection', features: feats } as any;
  }, [fincas]);

  useEffect(() => {
    const ensure = () => new Promise<void>((resolve) => {
      if ((window as any).maplibregl) return resolve();
      let link = document.querySelector('link[data-maplibre]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.css';
        link.setAttribute('data-maplibre','1');
        document.head.appendChild(link);
      }
      let script = document.querySelector('script[data-maplibre]') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.js';
        script.async = true;
        script.setAttribute('data-maplibre','1');
        script.onload = () => resolve();
        document.body.appendChild(script);
      } else {
        script.addEventListener('load', () => resolve(), { once: true });
      }
    });

    let disposed = false;
    ensure().then(() => {
      if (disposed || !mapRef.current) return;
      const gl = (window as any).maplibregl;
      if (!mapInstance.current) {
        mapInstance.current = new gl.Map({
          container: mapRef.current,
          style: 'https://demotiles.maplibre.org/style.json',
          center: [-79.445, -1.115],
          zoom: 11,
          attributionControl: true,
        });
        mapInstance.current.addControl(new gl.NavigationControl({ visualizePitch: false }), 'top-right');
      }
      const map = mapInstance.current;
      const addOrUpdate = () => {
        if (!map.getSource('osm')) {
          map.addSource('osm', {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          });
          map.addLayer({ id: 'osm-layer', type: 'raster', source: 'osm' });
        }
        if (!map.getSource('fincas-mini')) {
          map.addSource('fincas-mini', { type: 'geojson', data: featureCollection });
          map.addLayer({ id: 'fincas-mini-fill', type: 'fill', source: 'fincas-mini', paint: { 'fill-color': [ 'case', ['>=', ['get','rendimientoHa'], 45], '#1a5e20', ['>=', ['get','rendimientoHa'], 35], '#2e7d32', ['>=', ['get','rendimientoHa'], 25], '#fbc02d', '#e53935' ], 'fill-opacity': 0.6 } });
          map.addLayer({ id: 'fincas-mini-outline', type: 'line', source: 'fincas-mini', paint: { 'line-color': '#2c3e50', 'line-width': 1 } });
        } else {
          (map.getSource('fincas-mini') as any).setData(featureCollection);
        }
        if (!map.getSource('lotes-mini')) {
          map.addSource('lotes-mini', { type: 'geojson', data: lotFeatures });
          map.addLayer({
            id: 'lotes-mini-circle',
            type: 'circle',
            source: 'lotes-mini',
            paint: {
              'circle-color': '#2e7d32',
              'circle-opacity': 0.9,
              'circle-stroke-color': '#243624',
              'circle-stroke-width': 1,
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 14, 6]
            }
          });
        } else {
          (map.getSource('lotes-mini') as any).setData(lotFeatures);
        }
      };
      if (map.loaded()) addOrUpdate(); else map.once('load', addOrUpdate);

      // Ajustar vista a los límites de todas las fincas, igual que el mapa previo
      try {
        const bounds = new gl.LngLatBounds();
        features.forEach((feat: any) => {
          const g = feat?.geometry;
          const t = g?.type;
          const c = g?.coordinates;
          if (t === 'Polygon' && Array.isArray(c)) {
            c.forEach((ring: number[][]) => ring.forEach(([lng, lat]) => bounds.extend([lng, lat])));
          } else if (t === 'MultiPolygon' && Array.isArray(c)) {
            c.forEach((poly: number[][][]) => poly.forEach((ring: number[][]) => ring.forEach(([lng, lat]) => bounds.extend([lng, lat]))));
          }
        });
        if (bounds && (bounds as any)._ne) {
          map.fitBounds(bounds, { padding: 20 });
        }
      } catch {}

      try {
        const ResizeObserverCtor = (window as any).ResizeObserver;
        const ro = ResizeObserverCtor ? new ResizeObserverCtor(() => map.resize()) : null;
        if (ro && mapRef.current) ro.observe(mapRef.current);
        setTimeout(() => map.resize(), 0);
      } catch {}
    });
    return () => { disposed = true; };
  }, [featureCollection, lotFeatures]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    // Marcadores de centroides de finca para referencia rápida
    const gl = (window as any).maplibregl;
    const markers: any[] = [];
    fincas.forEach((f) => {
      const centroid = getCentroid(f.geom);
      if (centroid) {
        const mc = new gl.Marker({ color: '#1976d2' })
          .setLngLat([centroid[1], centroid[0]])
          .setPopup(new gl.Popup().setHTML(`<div class="text-sm"><div class="font-semibold">${f.nombre}</div><div>${(f.hectareas ?? 0).toFixed(1)} ha</div></div>`))
          .addTo(map);
        markers.push(mc);
      }
    });
    return () => { markers.forEach((m) => m.remove()); };
  }, [fincas]);

  return <div ref={mapRef} className="responsive-map w-full rounded-md overflow-hidden" />;
}