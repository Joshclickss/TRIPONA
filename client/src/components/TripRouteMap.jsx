import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass } from 'lucide-react';

export default function TripRouteMap({ waypoints = [], destination = '', className = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const defaultCenter = [9.9312, 76.2673]; // Default Kerala/India or fallback
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      // Add dark luxury tile layer (Esri Dark Canvas, 100% free, no watermark)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Esri, HERE, Garmin'
      }).addTo(map);

      // Add dark labels overlay
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        opacity: 0.8
      }).addTo(map);

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer group for dynamic markers & polyline
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    // Clear previous markers & polylines
    layerGroup.clearLayers();

    if (!Array.isArray(waypoints) || waypoints.length === 0) {
      return;
    }

    const latLngs = [];

    waypoints.forEach((wp, idx) => {
      if (typeof wp.lat !== 'number' || typeof wp.lng !== 'number') return;

      const position = [wp.lat, wp.lng];
      latLngs.push(position);

      const isStart = wp.type === 'start' || idx === 0;
      const isEnd = idx === waypoints.length - 1;
      const badgeColor = isStart ? '#06B6D4' : isEnd ? '#EC4899' : '#A855F7';

      // Custom Glowing DivIcon
      const markerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${badgeColor}; opacity: 0.35; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #0D0F14; border: 2px solid ${badgeColor}; box-shadow: 0 0 15px ${badgeColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; font-family: monospace;">
            ${idx + 1}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'tripona-map-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker(position, { icon: customIcon });

      // Rich dark popup
      const popupHtml = `
        <div style="background: #0F1218; color: #FFFFFF; padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); min-width: 160px; font-family: sans-serif;">
          <div style="font-size: 10px; font-family: monospace; color: ${badgeColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">
            ${isStart ? 'Starting Point' : `Stop #${idx + 1} • Day ${wp.day || idx + 1}`}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #FFFFFF; margin-bottom: 4px;">
            ${wp.name || 'Waypoint'}
          </div>
          ${wp.description ? `<div style="font-size: 11px; color: #94A3B8; line-height: 1.3;">${wp.description}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'tripona-leaflet-popup',
        closeButton: false
      });

      layerGroup.addLayer(marker);
    });

    // Draw route polyline connecting waypoints
    if (latLngs.length > 1) {
      // Glow background line
      const glowLine = L.polyline(latLngs, {
        color: '#A855F7',
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      });
      layerGroup.addLayer(glowLine);

      // Sharp dashed foreground line
      const routeLine = L.polyline(latLngs, {
        color: '#06B6D4',
        weight: 2.5,
        opacity: 0.9,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });
      layerGroup.addLayer(routeLine);

      // Fit map viewport to include all waypoints
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 9);
    }

    // Force redraw on container resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map instance alive or clean up
    };
  }, [waypoints]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/10 bg-[#090B0E] shadow-2xl ${className}`}>
      {/* Top overlay badge */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0D12]/90 backdrop-blur-md border border-white/10 text-xs text-white">
        <Compass size={14} className="text-[#06B6D4] animate-spin-slow" />
        <span className="font-semibold">{destination || 'AI Route Optimization'}</span>
        {waypoints.length > 0 && (
          <span className="text-[10px] text-white/50 border-l border-white/10 pl-2">
            {waypoints.length} Waypoints
          </span>
        )}
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

      {/* Waypoint legend at bottom */}
      {waypoints.length > 0 && (
        <div className="absolute bottom-3 left-3 right-16 z-[400] flex items-center gap-2 overflow-x-auto py-1 px-2.5 rounded-xl bg-[#090C10]/85 backdrop-blur-md border border-white/10 scrollbar-none text-[11px] text-white/80">
          <Navigation size={12} className="text-[#A855F7] shrink-0" />
          <span className="shrink-0 text-white/50 text-[10px]">ROUTE:</span>
          {waypoints.map((wp, i) => (
            <React.Fragment key={i}>
              <span className="shrink-0 font-medium hover:text-cyan-300 transition-colors cursor-pointer">
                {wp.name.split('(')[0].trim()}
              </span>
              {i < waypoints.length - 1 && <span className="text-white/30 shrink-0">→</span>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
