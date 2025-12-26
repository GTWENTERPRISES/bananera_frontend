"use client";

import { useMemo, useEffect, useRef } from "react";
import { useApp } from "@/src/contexts/app-context";
import type { Finca } from "@/src/lib/types";

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

export function MapGeneral({ selectedFinca }: { selectedFinca?: string }) {
  const { fincas, cosechas, empleados, insumos } = useApp();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const fincaLinks: Record<string, string> = {
    BABY: "https://maps.app.goo.gl/oBSwV5z1GYJTL2HH8",
    SOLO: "https://maps.app.goo.gl/b3WkLYpdYUot6fYGA",
    LAURITA: "https://maps.app.goo.gl/S9crU6ZatQ9vAJPu8",
    MARAVILLA: "https://maps.app.goo.gl/aJwCkTjyoKknvmUy7",
  };

  const features = useMemo(() => {
    const latestByFinca = new Map<string, { cajas: number }>();
    for (const c of cosechas) {
      const prev = latestByFinca.get(c.finca);
      if (!prev) {
        latestByFinca.set(c.finca, { cajas: c.cajasProducidas });
      } else {
        if (c.cajasProducidas >= prev.cajas) {
          latestByFinca.set(c.finca, { cajas: c.cajasProducidas });
        }
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
        properties: {
          nombre: f.nombre,
          hectareas: f.hectareas,
          rendimientoHa,
        },
      });
    }
    return feats;
  }, [fincas, cosechas]);

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

  const bodegaMarkers = useMemo(() => {
    const stockBajo = insumos.filter(
      (i) => i.stockActual < i.stockMinimo
    ).length;
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

  const lotMarkers = useMemo(() => {
    const markers: { finca: string; lote: string; position: [number, number] }[] = [];
    for (const f of fincas) {
      const l = f.lotes;
      if (!l) continue;
      for (const key of ["A","B","C","D","E"] as const) {
        const pos = l[key];
        if (pos) markers.push({ finca: f.nombre, lote: key, position: [pos.lat, pos.lng] });
      }
    }
    return markers;
  }, [fincas]);

  const featureCollection = useMemo(() => ({
    type: "FeatureCollection",
    features: features,
  }), [features]);

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
      const maplibregl = (window as any).maplibregl;
      if (!mapInstance.current) {
        mapInstance.current = new maplibregl.Map({
          container: mapRef.current,
          style: 'https://demotiles.maplibre.org/style.json',
          center: [center[1], center[0]],
          zoom: 13,
          attributionControl: true
        });
        mapInstance.current.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
      }
      const map = mapInstance.current;
      const data = featureCollection as any;
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
            attribution: '&copy; OpenStreetMap contributors'
          });
          map.addLayer({ id: 'osm-layer', type: 'raster', source: 'osm' });
        }
        if (!map.getSource('fincas')) {
          map.addSource('fincas', { type: 'geojson', data });
          map.addLayer({ id: 'fincas-fill', type: 'fill', source: 'fincas', paint: { 'fill-color': [ 'case', ['>=', ['get','rendimientoHa'], 45], '#1a5e20', ['>=', ['get','rendimientoHa'], 35], '#2e7d32', ['>=', ['get','rendimientoHa'], 25], '#fbc02d', '#e53935' ], 'fill-opacity': 0.5 } });
          map.addLayer({ id: 'fincas-outline', type: 'line', source: 'fincas', paint: { 'line-color': '#1a5e20', 'line-width': 1.2 } });
          map.addLayer({ id: 'fincas-selected', type: 'line', source: 'fincas', filter: ['==', ['get','nombre'], selectedFinca || '' ], paint: { 'line-color': '#1976d2', 'line-width': 2 } });
        } else {
          (map.getSource('fincas') as any).setData(data);
        }
      };
      if (map.loaded()) addOrUpdate(); else map.once('load', addOrUpdate);
    });
    return () => { disposed = true; };
  }, [center, featureCollection, selectedFinca]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (map.getLayer('fincas-selected')) {
      map.setFilter('fincas-selected', ['==', ['get','nombre'], selectedFinca || '' ]);
    }
    const g: any = fincas.find((x) => x.nombre === selectedFinca && x.geom)?.geom;
    const coords = g?.coordinates;
    const type = g?.type;
    let ring: number[][] | null = null;
    if (type === 'Polygon' && Array.isArray(coords)) ring = coords[0];
    else if (type === 'MultiPolygon' && Array.isArray(coords)) ring = coords[0]?.[0] ?? null;
    const bounds = new ((window as any).maplibregl).LngLatBounds();
    if (ring) ring.forEach(([lng, lat]) => bounds.extend([lng, lat]));
    if (ring && bounds) map.fitBounds(bounds, { padding: 30 });
  }, [selectedFinca, fincas]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const gl = (window as any).maplibregl;
    crewMarkers.forEach((m) => {
      const color = m.count > 0 ? '#1976d2' : '#9e9e9e';
      const marker = new gl.Marker({ color }).setLngLat([m.position[1], m.position[0]]).setPopup(new gl.Popup().setHTML(`<div class="text-sm"><div class="font-semibold">${m.finca}</div><div>Cuadrillas activas (Enfunde): ${m.count}</div></div>`)).addTo(map);
      markersRef.current.push(marker);
    });
    bodegaMarkers.forEach((b) => {
      const color = b.stockBajo > 0 ? '#d32f2f' : '#2e7d32';
      const marker = new gl.Marker({ color }).setLngLat([b.position[1], b.position[0]]).setPopup(new gl.Popup().setHTML(`<div class="text-sm"><div class="font-semibold">${b.nombre}</div><div>Insumos con stock bajo: ${b.stockBajo}</div></div>`)).addTo(map);
      markersRef.current.push(marker);
    });
    lotMarkers.forEach((l) => {
      const marker = new gl.Marker({ color: '#2e7d32' }).setLngLat([l.position[1], l.position[0]]).setPopup(new gl.Popup().setHTML(`<div class="text-sm"><div class="font-semibold">${l.finca}</div><div>Lote ${l.lote}</div></div>`)).addTo(map);
      markersRef.current.push(marker);
    });
  }, [crewMarkers, bodegaMarkers, lotMarkers]);

  useEffect(() => {
    const map = mapInstance.current;
    const node = mapRef.current;
    if (!map || !node) return;
    const ResizeObserverCtor = (window as any).ResizeObserver;
    const ro = ResizeObserverCtor ? new ResizeObserverCtor(() => map.resize()) : null;
    if (ro) ro.observe(node);
    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div ref={mapRef} className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] rounded-md overflow-hidden" />
  );
}
