'use client';

import { useEffect, useRef, useState } from 'react';
import { Navigation, Compass } from 'lucide-react';

interface RealTrackingMapProps {
  workerName?: string;
  customerAddress?: string;
  initialDistanceKm?: number;
}

export default function RealTrackingMap({
  workerName = 'Service Partner',
  customerAddress = 'B/402, Shanti Heights, Navrangpura, Ahmedabad',
  initialDistanceKm = 2.4,
}: RealTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const workerMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [distanceKm, setDistanceKm] = useState(initialDistanceKm);
  const [etaMins, setEtaMins] = useState(8);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isArrived, setIsArrived] = useState(false);

  // Dynamic first name for compact map pins
  const partnerFirstName = workerName ? workerName.trim().split(/\s+/)[0] : 'Partner';

  // Ahmedabad coordinates
  // Destination: Customer home in Navrangpura
  const customerCoord: [number, number] = [23.0368, 72.5615];
  // Origin: Worker starting location near Paldi
  const startCoord: [number, number] = [23.0135, 72.5570];

  // Granular 10-step road path from Paldi to Navrangpura along C.G. Road
  const waypoints: [number, number][] = [
    [23.0135, 72.5570], // 0: Paldi Cross Road
    [23.0162, 72.5578], // 1: Mahalaxmi Cross Road
    [23.0195, 72.5589], // 2: VS Hospital Approach
    [23.0224, 72.5596], // 3: Ellis Bridge Circle
    [23.0252, 72.5601], // 4: Law Garden Junction
    [23.0280, 72.5605], // 5: C.G. Road Junction
    [23.0305, 72.5609], // 6: Municipal Market
    [23.0332, 72.5612], // 7: Swastik Cross Road
    [23.0352, 72.5614], // 8: Stadium Cross Road
    [23.0368, 72.5615], // 9: Arrived at Customer Location
  ];

  // Helper to create worker divIcon
  const createWorkerIcon = (L: any, arrived: boolean) => {
    if (arrived) {
      return L.divIcon({
        className: 'custom-worker-icon',
        html: `
          <div style="position: relative; width: 44px; height: 44px;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: linear-gradient(135deg, #10b981, #047857); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(4,120,87,0.6); border: 2.5px solid white; position: absolute; top: 4px; left: 4px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: #064e3b; color: #a7f3d0; font-size: 9px; font-weight: 800; padding: 1px 7px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
              ${partnerFirstName} (Arrived)
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
    }

    return L.divIcon({
      className: 'custom-worker-icon',
      html: `
        <div style="position: relative; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #042f2e; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(217,119,6,0.6); border: 2.5px solid white; position: absolute; top: 4px; left: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
          </div>
          <div style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: #042f2e; color: #6ee7b7; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            ${partnerFirstName} (En Route)
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  };

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet only on client side
    const initLeaflet = async () => {
      if (!mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        leafletRef.current = L;

        // Inject leaflet CSS via link tag
        if (!document.querySelector('#leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
          await new Promise((r) => setTimeout(r, 50));
        }

        if (!isMounted || mapInstanceRef.current) return;

        // Center between worker start and customer
        const midLat = (startCoord[0] + customerCoord[0]) / 2;
        const midLng = (startCoord[1] + customerCoord[1]) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [midLat, midLng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        // Customer Marker
        const customerIcon = L.divIcon({
          className: 'custom-customer-icon',
          html: `
            <div style="background-color: #0d9488; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(13,148,136,0.5); border: 2px solid white; position: relative;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <div style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); background: #042f2e; color: #fef08a; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 6px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);">
                Service Address
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker(customerCoord, { icon: customerIcon })
          .addTo(map)
          .bindPopup(`<b>Service Location</b><br/>${customerAddress}`);

        // Worker Marker
        const workerMarker = L.marker(startCoord, { icon: createWorkerIcon(L, false) }).addTo(map);
        workerMarkerRef.current = workerMarker;

        // Route Polyline
        const routeLine = L.polyline(waypoints, {
          color: '#0d9488',
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map);
        routeLineRef.current = routeLine;

        map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
        setMapLoaded(true);
      } catch (err) {
        console.error('Leaflet load error:', err);
      }
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Automated Real-Time Worker GPS Movement Along Waypoints
  useEffect(() => {
    if (!mapLoaded) return;

    let currentIndex = 0;
    const totalWaypoints = waypoints.length;

    const interval = setInterval(() => {
      if (currentIndex < totalWaypoints - 1) {
        currentIndex += 1;
        const currentCoord = waypoints[currentIndex];

        if (workerMarkerRef.current) {
          workerMarkerRef.current.setLatLng(currentCoord);
        }

        // Calculate real-time dynamic distance and ETA
        const remainingFraction = (totalWaypoints - 1 - currentIndex) / (totalWaypoints - 1);
        const newDist = Number((initialDistanceKm * remainingFraction).toFixed(1));
        const newEta = Math.round(8 * remainingFraction);

        if (currentIndex === totalWaypoints - 1) {
          setIsArrived(true);
          setDistanceKm(0.0);
          setEtaMins(0);
          if (leafletRef.current && workerMarkerRef.current) {
            workerMarkerRef.current.setIcon(createWorkerIcon(leafletRef.current, true));
          }
        } else {
          setDistanceKm(Math.max(0.1, newDist));
          setEtaMins(Math.max(1, newEta));
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [mapLoaded, initialDistanceKm]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && routeLineRef.current) {
      mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div className="relative w-full h-64 sm:h-72 bg-slate-100 overflow-hidden border-b border-slate-200">
      {/* Real Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Status Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-[#042f2e]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-teal-500/30 flex items-center gap-2 pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-extrabold tracking-wide uppercase text-emerald-100">
            Live GPS Active • Ahmedabad
          </span>
        </div>

        <button
          onClick={handleRecenter}
          className="bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1 transition pointer-events-auto active:scale-95 cursor-pointer"
          title="Recenter Map"
        >
          <Compass className="w-4 h-4 text-teal-700" />
          <span className="text-[10px] hidden sm:inline">Recenter</span>
        </button>
      </div>

      {/* Bottom Floating Route Info Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isArrived ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-teal-50 border border-teal-200 text-teal-700'
          }`}>
            <Navigation className={`w-4 h-4 ${isArrived ? '' : 'animate-pulse'}`} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-900 leading-tight">
              {isArrived ? '0.0 km away • Arrived' : `${distanceKm} km away • ~${etaMins} mins ETA`}
            </p>
            <p className="text-[10px] text-slate-500 truncate max-w-[180px] sm:max-w-xs">
              {isArrived ? 'Partner has reached customer location' : 'Navrangpura Route via C.G. Road'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
            isArrived 
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}>
            {isArrived ? '✓ Arrived' : 'En Route'}
          </span>
        </div>
      </div>
    </div>
  );
}
