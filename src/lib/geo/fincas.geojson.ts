// GeoJSON de las fincas de Bananera HG (ubicaciones precisas en zona Valencia/Quevedo)
// Nota: Estos polígonos son de ejemplo para desarrollo. Sustituir con datos reales exportados desde QGIS/Google Earth.

export type FincaFeatureProperties = {
  nombre: "BABY" | "SOLO" | "LAURITA" | "MARAVILLA";
  hectareas: number;
};

export type FincaFeature = {
  type: "Feature";
  properties: FincaFeatureProperties;
  geometry: {
    type: "Polygon";
    // [ [ [lng, lat], ... ] ]
    coordinates: number[][][];
  };
};

export type FincaFeatureCollection = {
  type: "FeatureCollection";
  features: FincaFeature[];
};

export const fincasGeoJSON: FincaFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { nombre: "BABY", hectareas: 45.5 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-79.3460, -0.9924],
            [-79.3420, -0.9924],
            [-79.3420, -0.9884],
            [-79.3460, -0.9884],
            [-79.3460, -0.9924],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { nombre: "SOLO", hectareas: 38.2 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-79.3509, -1.0062],
            [-79.3470, -1.0062],
            [-79.3470, -1.0022],
            [-79.3509, -1.0022],
            [-79.3509, -1.0062],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { nombre: "LAURITA", hectareas: 52.8 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-79.3576, -1.0151],
            [-79.3536, -1.0151],
            [-79.3536, -1.0111],
            [-79.3576, -1.0111],
            [-79.3576, -1.0151],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { nombre: "MARAVILLA", hectareas: 61.3 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-79.3662, -1.0236],
            [-79.3621, -1.0236],
            [-79.3621, -1.0196],
            [-79.3662, -1.0196],
            [-79.3662, -1.0236],
          ],
        ],
      },
    },
  ],
};
