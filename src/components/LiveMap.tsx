import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinates, Driver, Shipment } from '../types';

// Fix default marker icons in Vite (Leaflet pulls them from the wrong path otherwise)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const driverIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: `<div style="background:#1f6feb;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">&#128663;</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: `<div style="background:#ef4444;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">&#128205;</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface Props {
  center?: Coordinates;
  zoom?: number;
  drivers?: Driver[];
  shipments?: Shipment[];
  showRoute?: boolean;
  height?: string;
}

function FitBounds({ points }: { points: Coordinates[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [points, map]);
  return null;
}

export default function LiveMap({
  center = { lat: 6.8957, lng: 79.8579 },
  zoom = 13,
  drivers = [],
  shipments = [],
  showRoute = false,
  height = '420px',
}: Props) {
  const allPoints: Coordinates[] = [
    ...drivers.map((d) => d.currentLocation),
    ...shipments.map((s) => s.destinationCoords),
  ];

  return (
    // isolate: Leaflet panes use z-index 400-1000 internally, which would
    // otherwise paint over fixed overlays like the modals (z-40/z-50)
    <div
      style={{ height }}
      className="isolate relative z-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm"
    >
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {drivers.map((d) => (
          <Marker
            key={d.id}
            position={[d.currentLocation.lat, d.currentLocation.lng]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{d.name}</div>
                <div className="text-slate-600">{d.vehicle}</div>
                <div className="mt-1 text-xs capitalize text-slate-500">Status: {d.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {shipments.map((s) => (
          <Marker
            key={s.id}
            position={[s.destinationCoords.lat, s.destinationCoords.lng]}
            icon={stopIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{s.trackingNumber}</div>
                <div className="text-slate-600">{s.destination}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {showRoute && drivers[0] && shipments.length > 0 && (
          <Polyline
            positions={[
              [drivers[0].currentLocation.lat, drivers[0].currentLocation.lng],
              ...shipments.map(
                (s) => [s.destinationCoords.lat, s.destinationCoords.lng] as [number, number]
              ),
            ]}
            pathOptions={{ color: '#1f6feb', weight: 3, dashArray: '6 8' }}
          />
        )}
        <FitBounds points={allPoints} />
      </MapContainer>
    </div>
  );
}
