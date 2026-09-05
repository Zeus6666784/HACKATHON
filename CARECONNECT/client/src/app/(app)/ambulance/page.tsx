"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PALGHAR_CENTER } from "@/lib/geo";
import { Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";

// Custom Ambulance Icon
const ambulanceIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(239,68,68,.45);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;">🚑</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

type AmbulanceStatus = "Available" | "Busy" | "Offline";

type Ambulance = {
  id: string;
  vehicleNumber: string;
  driverName: string;
  status: AmbulanceStatus;
  lat: number;
  lng: number;
  lastUpdated: string;
};

const MOCK_AMBULANCES: Ambulance[] = [
  { id: "1", vehicleNumber: "MH-15-A-1234", driverName: "Rajesh Kumar", status: "Available", lat: 19.69, lng: 72.92, lastUpdated: "2 mins ago" },
  { id: "2", vehicleNumber: "MH-15-A-5678", driverName: "Suresh Patil", status: "Busy", lat: 19.72, lng: 72.95, lastUpdated: "Just now" },
  { id: "3", vehicleNumber: "MH-15-A-9012", driverName: "Amit Singh", status: "Offline", lat: 19.65, lng: 72.88, lastUpdated: "1 hour ago" },
  { id: "4", vehicleNumber: "MH-15-B-3456", driverName: "Vijay More", status: "Available", lat: 19.75, lng: 72.90, lastUpdated: "5 mins ago" },
];

export default function AmbulanceTrackingPage() {
  const { session } = useAuth();
  const locale = session?.locale || "en";

  const statusColors = {
    Available: "bg-green-100 text-green-700",
    Busy: "bg-amber-100 text-amber-700",
    Offline: "bg-gray-100 text-gray-700",
  };

  const statusIcons = {
    Available: <CheckCircle className="h-3 w-3" />,
    Busy: <Clock className="h-3 w-3" />,
    Offline: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-950">{t(locale, "ambulanceTracking")}</h1>
          <p className="text-sm text-cyan-800/70">Real-time location and status of emergency vehicles</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-cyan-100 text-[11px] font-medium text-cyan-900">
             <span className="h-2 w-2 rounded-full bg-green-500" /> {MOCK_AMBULANCES.filter(a => a.status === "Available").length} Available
           </div>
           <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-cyan-100 text-[11px] font-medium text-cyan-900">
             <span className="h-2 w-2 rounded-full bg-amber-500" /> {MOCK_AMBULANCES.filter(a => a.status === "Busy").length} Busy
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-soft">
          <MapContainer
            center={[PALGHAR_CENTER.lat, PALGHAR_CENTER.lng]}
            zoom={11}
            scrollWheelZoom={false}
            className="h-[500px] w-full"
            aria-label="Ambulance tracking map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {MOCK_AMBULANCES.map((amb) => (
              <Marker key={amb.id} position={[amb.lat, amb.lng]} icon={ambulanceIcon}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-cyan-950">{amb.vehicleNumber}</p>
                    <p className="text-xs text-cyan-800">{amb.driverName}</p>
                    <div className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[amb.status]}`}>
                      {amb.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-cyan-900 px-1">Ambulance Fleet</h2>
          <div className="grid gap-3">
            {MOCK_AMBULANCES.map((amb) => (
              <div
                key={amb.id}
                className="group relative flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white p-3 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold text-sm text-cyan-950">{amb.vehicleNumber}</p>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[amb.status]}`}>
                      {statusIcons[amb.status]}
                      {amb.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-cyan-800">{amb.driverName}</p>
                    <p className="text-[10px] text-cyan-700/60">{amb.lastUpdated}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
