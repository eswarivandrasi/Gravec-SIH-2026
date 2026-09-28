import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Circle, 
  Polygon,
  LayersControl,
  LayerGroup
} from 'react-leaflet';
import L from 'leaflet';

// Custom Leaflet Icons using SVG Data URIs
const createStormIcon = (category = 3) => {
  const size = 38;
  return L.divIcon({
    className: 'custom-cyclone-icon',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div style="position: absolute; inset: 0; background: rgba(239, 68, 68, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; inset: 4px; background: #dc2626; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(220, 38, 38, 0.8);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A6 6 0 0 1 6.07 12H6a1 1 0 0 1 0-2h.07A6 6 0 0 1 11 4.07V4a1 1 0 0 1 2 0v.07A6 6 0 0 1 17.93 11H18a1 1 0 0 1 0 2h-.07A6 6 0 0 1 13 16.93z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const pastTrackIcon = (wind) => {
  return L.divIcon({
    className: 'past-track-icon',
    html: `<div style="width: 12px; height: 12px; background: #f59e0b; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 6px #f59e0b;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const shelterIcon = L.divIcon({
  className: 'shelter-icon',
  html: `<div style="width: 14px; height: 14px; background: #10b981; border: 2px solid #ffffff; border-radius: 3px; box-shadow: 0 0 6px #10b981;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export const CycloneMap = ({ 
  cyclone, 
  observations = [], 
  shelters = [],
  height = "520px" 
}) => {
  const defaultCenter = [15.8, 84.2];
  const center = cyclone ? [cyclone.current_latitude, cyclone.current_longitude] : defaultCenter;

  // Build Track Points
  const trackCoords = observations.length > 0 
    ? observations.map(o => [o.latitude, o.longitude])
    : [
        [12.1, 87.8],
        [12.9, 87.1],
        [13.7, 86.4],
        [14.4, 85.6],
        [15.1, 84.9],
        [15.5, 84.5],
        [15.8, 84.2]
      ];

  // Projected Cone of Uncertainty (Towards Visakhapatnam / Kalingapatnam / Puri Coast)
  const currentPos = trackCoords[trackCoords.length - 1] || [15.8, 84.2];
  const conePolygon = [
    currentPos,
    [16.8, 83.2], // Left margin (+12h)
    [17.9, 83.0], // Left landfall point (Visakhapatnam)
    [18.8, 84.2], // Right landfall point (Puri / Gopalpur)
    [17.4, 85.2], // Right margin (+12h)
    currentPos
  ];

  const projectedTrack = [
    currentPos,
    [16.7, 83.9], // +12h
    [17.6, 83.5], // +24h Projected Landfall near Bheemunipatnam
    [18.5, 83.2]  // +36h Inland depression
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950">
      
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs shadow-lg space-y-1">
        <div className="font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>{cyclone?.name || "Cyclone VAYU-26"}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
            {cyclone?.classification || "Very Severe Cyclonic Storm"}
          </span>
        </div>
        <div className="text-[11px] text-slate-300 font-mono flex items-center gap-3">
          <span>Lat: {cyclone?.current_latitude || 15.8}°N, Lon: {cyclone?.current_longitude || 84.2}°E</span>
          <span>Wind: <strong className="text-cyan-300">{cyclone?.max_wind_speed || 145} km/h</strong></span>
          <span>Pressure: <strong className="text-amber-300">{cyclone?.min_pressure || 968} hPa</strong></span>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: height, width: "100%", background: "#0b132b" }}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="osm-map-tiles"
        />

        {/* Historical Track Polyline */}
        <Polyline
          positions={trackCoords}
          pathOptions={{ color: '#38bdf8', weight: 3.5, opacity: 0.85, dashArray: '1, 6' }}
        />

        {/* Projected Future Track */}
        <Polyline
          positions={projectedTrack}
          pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.9, dashArray: '6, 6' }}
        />

        {/* Projected Cone of Uncertainty Polygon */}
        <Polygon
          positions={conePolygon}
          pathOptions={{
            color: '#f43f5e',
            weight: 1.5,
            fillColor: '#f43f5e',
            fillOpacity: 0.18,
            dashArray: '4, 4'
          }}
        >
          <Popup>
            <div className="text-xs">
              <strong className="text-red-400 font-bold">Projected Cone of Uncertainty (70% Confidence)</strong>
              <p className="text-slate-200 mt-1">High probability landfall corridor between Visakhapatnam (AP) and Gopalpur (Odisha).</p>
            </div>
          </Popup>
        </Polygon>

        {/* Wind Danger Radii (Outer Gale: 34kt, Destructive Storm: 50kt, Hurricane Core: 64kt) */}
        <Circle
          center={center}
          radius={160000} // 160 km (34 kt / 62 km/h gale radius)
          pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.08, weight: 1 }}
        />
        <Circle
          center={center}
          radius={95000} // 95 km (50 kt / 90 km/h storm radius)
          pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.12, weight: 1 }}
        />
        <Circle
          center={center}
          radius={45000} // 45 km (64 kt / 120 km/h core eyewall radius)
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 1.5 }}
        />

        {/* Past Observations Track Markers */}
        {observations.map((obs, idx) => (
          <Marker
            key={obs.id || idx}
            position={[obs.latitude, obs.longitude]}
            icon={pastTrackIcon(obs.wind_speed)}
          >
            <Popup>
              <div className="text-xs space-y-1 font-mono">
                <div className="font-bold text-slate-900">Observation #{idx + 1}</div>
                <div>Time: {new Date(obs.timestamp).toLocaleString()}</div>
                <div>Wind: {obs.wind_speed} km/h</div>
                <div>Pressure: {obs.pressure} hPa</div>
                <div>SST: {obs.sst}°C</div>
                <div>Direction: {obs.movement_direction} @ {obs.movement_speed} km/h</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current Active Cyclone Eye Marker */}
        <Marker position={center} icon={createStormIcon(cyclone?.category || 3)}>
          <Popup>
            <div className="text-xs space-y-1.5 min-w-[200px]">
              <div className="font-bold text-red-600 text-sm">{cyclone?.name || "Cyclone VAYU-26"}</div>
              <div className="font-semibold text-slate-800">{cyclone?.classification || "Very Severe Cyclonic Storm"}</div>
              <div className="grid grid-cols-2 gap-1 text-[11px] bg-slate-100 p-2 rounded">
                <div>Wind: <strong>{cyclone?.max_wind_speed || 145} km/h</strong></div>
                <div>Press: <strong>{cyclone?.min_pressure || 968} hPa</strong></div>
                <div>Moving: <strong>{cyclone?.movement_direction || "NNW"}</strong></div>
                <div>Speed: <strong>{cyclone?.movement_speed || 16} km/h</strong></div>
              </div>
              <div className="text-[10px] text-amber-700 font-medium">
                ⚠️ Landfall estimated in ~24h near North Andhra coast.
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Coastal Emergency Shelters */}
        {shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.latitude, shelter.longitude]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[180px]">
                <div className="font-bold text-emerald-700">{shelter.name}</div>
                <div className="text-slate-600">{shelter.district}, {shelter.state}</div>
                <div className="text-[11px] text-slate-800">
                  Capacity: <strong>{shelter.current_occupancy}/{shelter.capacity} citizens</strong>
                </div>
                <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Status: {shelter.status} | Phone: {shelter.contact_phone}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-[11px] shadow-lg space-y-1.5">
        <div className="font-bold text-slate-200 text-xs font-mono uppercase tracking-wider mb-1">
          Map Legend
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-red-600 border border-white inline-block" />
          <span>Current Cyclone Eye ({cyclone?.name || "VAYU"})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-1 bg-sky-400 border border-sky-300 inline-block" />
          <span>Observed Track (Telemetric)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-1 bg-red-500 border border-red-300 inline-block" />
          <span>Projected Path (+36h)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-2 bg-rose-500/40 border border-rose-400 inline-block rounded" />
          <span>Cone of Uncertainty (70%)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 bg-emerald-500 border border-white inline-block rounded-sm" />
          <span>Emergency Shelters</span>
        </div>
      </div>

    </div>
  );
};

export default CycloneMap;
