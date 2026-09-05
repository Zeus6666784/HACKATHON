"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PALGHAR_CENTER } from "@/lib/geo";

type Pin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  subtitle?: string;
};

const icon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:999px;background:#0891b2;border:3px solid white;box-shadow:0 2px 6px rgba(8,145,178,.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function FacilityMap({
  origin,
  pins,
}: {
  origin?: { lat: number; lng: number };
  pins: Pin[];
}) {
  const center = origin ?? PALGHAR_CENTER;
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={10}
      scrollWheelZoom={false}
      className="h-64 w-full"
      aria-label="Public facilities map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={[center.lat, center.lng]} radius={8} pathOptions={{ color: "#059669" }}>
        <Popup>Patient / search origin</Popup>
      </CircleMarker>
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
          <Popup>
            <strong>{p.name}</strong>
            {p.subtitle ? <div>{p.subtitle}</div> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
