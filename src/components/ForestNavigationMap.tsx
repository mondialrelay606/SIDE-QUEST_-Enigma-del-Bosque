import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WindmillPOI, ForestPack, PlayerSession } from '../types';
import { calculateHaversineDistance, calculateBearing, formatDistance } from '../utils/geo';
import { sounds } from '../utils/audio';
import {
  Compass,
  Navigation,
  Layers,
  Crosshair,
  Maximize2,
  Minimize2,
  Footprints,
  MapPin,
  CheckCircle,
  Lock,
  ArrowUp,
  Sparkles,
  Info,
  Camera,
  Plus,
  Minus,
  Eye,
  Sliders,
  X,
  Target,
  TreePine,
  Sun,
  Flame,
  RotateCcw
} from 'lucide-react';

interface ForestNavigationMapProps {
  session: PlayerSession;
  forest: ForestPack;
  playerLat: number;
  playerLng: number;
  currentPoi: WindmillPOI;
  onUpdateLocation: (lat: number, lng: number) => void;
  simulatedGps: boolean;
  onToggleSimulatedGps: () => void;
  isNearPoi: boolean;
  onOpenAR?: () => void;
}

type TileTheme = 'opentopo' | 'voyager' | 'satellite' | 'night';

interface TileConfig {
  name: string;
  shortName: string;
  icon: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string | string[];
  className?: string;
  hasOrganicFilter?: boolean;
}

export const ForestNavigationMap: React.FC<ForestNavigationMapProps> = ({
  session,
  forest,
  playerLat,
  playerLng,
  currentPoi,
  onUpdateLocation,
  simulatedGps,
  onToggleSimulatedGps,
  isNearPoi,
  onOpenAR,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const poiMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineShadowRef = useRef<L.Polyline | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const targetBeelineRef = useRef<L.Polyline | null>(null);
  const targetRadiusCircleRef = useRef<L.Circle | null>(null);

  // Default to OpenTopoMap with organic forest filters
  const [activeTheme, setActiveTheme] = useState<TileTheme>('opentopo');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [showSimControls, setShowSimControls] = useState(simulatedGps);
  const [selectedPoi, setSelectedPoi] = useState<WindmillPOI | null>(currentPoi || null);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Organic Forest Color Tuning (Contrast, Saturation & Earthy Warmth)
  const [organicFilterActive, setOrganicFilterActive] = useState(true);
  const [contrast, setContrast] = useState(122);      // 122% contrast for topographic relief
  const [saturation, setSaturation] = useState(145);  // 145% saturation for deep lush greens
  const [warmth, setWarmth] = useState(8);            // 8% sepia / earthy warmth

  // Bearing and distance to current target POI
  const distanceMeters = currentPoi
    ? calculateHaversineDistance(playerLat, playerLng, currentPoi.lat, currentPoi.lng)
    : 0;
  const bearing = currentPoi
    ? calculateBearing(playerLat, playerLng, currentPoi.lat, currentPoi.lng)
    : 0;

  // Cardinal direction text
  const getBearingText = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  // Convert decimal degrees to readable hemisphere string
  const formatCoord = (deg: number, isLat: boolean): string => {
    const dir = isLat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'O';
    const abs = Math.abs(deg);
    const d = Math.floor(abs);
    const minFloat = (abs - d) * 60;
    const m = Math.floor(minFloat);
    const s = Math.round((minFloat - m) * 60);
    return `${d}°${m}'${s}" ${dir}`;
  };

  // Curated, beautiful tile themes with OpenTopoMap as the organic base
  const tileThemes: Record<TileTheme, TileConfig> = {
    opentopo: {
      name: 'OpenTopoMap Orgánico (Bosque)',
      shortName: 'OpenTopo Orgánico',
      icon: '🌲',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map: &copy; OpenTopoMap (CC-BY-SA), &copy; OpenStreetMap',
      maxZoom: 17,
      subdomains: 'abc',
      className: 'forest-opentopo-organic',
      hasOrganicFilter: true,
    },
    voyager: {
      name: 'Senda Aventura (CARTO Voyager)',
      shortName: 'Aventura',
      icon: '🌿',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap',
      maxZoom: 19,
      subdomains: 'abcd',
    },
    satellite: {
      name: 'Satélite de Alta Definición',
      shortName: 'Satélite',
      icon: '🛰️',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar',
      maxZoom: 19,
    },
    night: {
      name: 'Bosque Místico (Nocturno)',
      shortName: 'Nocturno',
      icon: '🌌',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap',
      maxZoom: 19,
      subdomains: 'abcd',
    },
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [
      playerLat || forest.centerLat,
      playerLng || forest.centerLng,
    ];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Add subtle attribution control at bottom-left
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    // Initial tile layer with OpenTopoMap organic class
    const initialCfg = tileThemes[activeTheme];
    const tileLayer = L.tileLayer(initialCfg.url, {
      attribution: initialCfg.attribution,
      maxZoom: initialCfg.maxZoom,
      subdomains: initialCfg.subdomains || 'abc',
      className: initialCfg.className || '',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // POI markers layer group
    const poiLayerGroup = L.layerGroup().addTo(map);
    poiMarkersLayerRef.current = poiLayerGroup;

    mapInstanceRef.current = map;

    // Invalidate size on initial mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = tileThemes[activeTheme];
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      subdomains: cfg.subdomains || 'abc',
      className: cfg.className || '',
    }).addTo(map);
    tileLayerRef.current = newLayer;
  }, [activeTheme]);

  // Apply Organic CSS Filter directly to Leaflet tilePane
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const tilePane = map.getPane('tilePane');
    if (!tilePane) return;

    if (activeTheme === 'opentopo' && organicFilterActive) {
      tilePane.style.filter = `contrast(${contrast}%) saturate(${saturation}%) brightness(96%) sepia(${warmth}%) hue-rotate(-6deg)`;
      tilePane.style.transition = 'filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      tilePane.style.filter = 'none';
    }
  }, [activeTheme, organicFilterActive, contrast, saturation, warmth]);

  // Sync selectedPoi with currentPoi when currentPoi changes
  useEffect(() => {
    if (currentPoi) {
      setSelectedPoi(currentPoi);
    }
  }, [currentPoi?.id]);

  // Update Route Polyline & POI Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const poiGroup = poiMarkersLayerRef.current;
    if (!map || !poiGroup) return;

    poiGroup.clearLayers();

    // Ordered route POIs for this session
    const routePois = session.routePoiIds
      .map((id) => forest.pois.find((p) => p.id === id))
      .filter((p): p is WindmillPOI => !!p);

    if (routePois.length === 0) return;

    const routeCoords: [number, number][] = routePois.map((p) => [p.lat, p.lng]);

    // 1. Draw Underglow / Shadow trail ribbon
    if (routePolylineShadowRef.current) {
      map.removeLayer(routePolylineShadowRef.current);
    }
    const shadowPolyline = L.polyline(routeCoords, {
      color: activeTheme === 'night' ? '#042f2e' : '#053e2a',
      weight: 7,
      opacity: 0.55,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routePolylineShadowRef.current = shadowPolyline;

    // 2. Draw Active Trail Ribbon with crisp dashes
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }
    const polyline = L.polyline(routeCoords, {
      color: activeTheme === 'night' ? '#2dd4bf' : '#047857',
      weight: 3.5,
      opacity: 0.95,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routePolylineRef.current = polyline;

    // 3. Draw Direct Target Beeline from player to current target
    if (targetBeelineRef.current) {
      map.removeLayer(targetBeelineRef.current);
    }
    if (currentPoi) {
      const beeline = L.polyline(
        [
          [playerLat, playerLng],
          [currentPoi.lat, currentPoi.lng],
        ],
        {
          color: '#d97706',
          weight: 2.5,
          opacity: 0.9,
          dashArray: '5, 7',
        }
      ).addTo(map);
      targetBeelineRef.current = beeline;
    }

    // 4. Draw Detection / Arrival radius zone circle (35m)
    if (targetRadiusCircleRef.current) {
      map.removeLayer(targetRadiusCircleRef.current);
    }
    if (currentPoi) {
      const radiusCircle = L.circle([currentPoi.lat, currentPoi.lng], {
        radius: 35,
        color: isNearPoi ? '#10b981' : '#f59e0b',
        fillColor: isNearPoi ? '#10b981' : '#f59e0b',
        fillOpacity: isNearPoi ? 0.35 : 0.16,
        weight: isNearPoi ? 2.5 : 1.5,
        dashArray: isNearPoi ? undefined : '4, 6',
      }).addTo(poiGroup);
      targetRadiusCircleRef.current = radiusCircle;
    }

    // 5. Add bespoke handcrafted Waypoint Markers
    routePois.forEach((poi, index) => {
      const isCompleted = session.completedPois.includes(poi.id);
      const isCurrent = index === session.currentPoiIndex;
      const dist = calculateHaversineDistance(playerLat, playerLng, poi.lat, poi.lng);

      let markerContentHtml = '';

      if (isCurrent) {
        // Active Target Pin: pulsating golden-amber compass beacon
        markerContentHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer select-none group">
            <span class="absolute w-14 h-14 rounded-full bg-amber-400/25 animate-waypoint-pulse"></span>
            <span class="absolute w-10 h-10 rounded-full bg-amber-400/35 animate-ping"></span>
            
            <div class="relative z-10 w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-2xl shadow-amber-950/80 ring-2 ring-white transition-transform group-hover:scale-110">
              <div class="w-full h-full bg-[#182319] rounded-[14px] flex items-center justify-center text-xl">
                <span>${poi.emoji || '🎯'}</span>
              </div>
            </div>

            <div class="w-2.5 h-2.5 bg-amber-500 rotate-45 -mt-1.5 z-10 shadow-md"></div>

            <div class="absolute -bottom-6 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#142017]/95 backdrop-blur-sm border border-amber-400/80 text-amber-300 text-[10px] font-bold shadow-xl whitespace-nowrap z-20">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Punto ${index + 1} · ${formatDistance(dist)}</span>
            </div>
          </div>
        `;
      } else if (isCompleted) {
        // Completed Pin: Bronze-emerald seal with gold checkmark
        markerContentHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer select-none group">
            <div class="w-9 h-9 rounded-full bg-gradient-to-b from-emerald-600 to-teal-800 p-0.5 shadow-lg border border-emerald-300/80 flex items-center justify-center transition-transform group-hover:scale-110">
              <div class="w-full h-full rounded-full bg-[#102416] flex items-center justify-center text-emerald-300 text-sm font-bold">
                ✓
              </div>
            </div>
            <div class="absolute -bottom-5 px-1.5 py-0.2 rounded bg-black/80 border border-emerald-800/80 text-emerald-300 text-[9px] font-mono whitespace-nowrap">
              ${index + 1}
            </div>
          </div>
        `;
      } else {
        // Upcoming / Locked Waypoint: Atmospheric weathered slate token
        markerContentHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer select-none opacity-85 group">
            <div class="w-8 h-8 rounded-full bg-stone-900 border border-stone-600 text-stone-300 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 group-hover:border-stone-400">
              <span class="text-xs font-adventure font-bold text-stone-300">${index + 1}</span>
            </div>
            <div class="absolute -bottom-5 px-1.5 py-0.2 rounded bg-black/70 border border-stone-700 text-stone-400 text-[9px] font-mono whitespace-nowrap">
              Punto ${index + 1}
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: markerContentHtml,
        className: 'poi-custom-marker',
        iconSize: [44, 44],
        iconAnchor: [22, isCurrent ? 26 : 20],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: customIcon }).addTo(poiGroup);

      marker.on('click', () => {
        sounds.playClick();
        setSelectedPoi(poi);
      });
    });
  }, [session, forest, currentPoi, playerLat, playerLng, isNearPoi, activeTheme, selectedPoi?.id]);

  // Update Player GPS Marker & Orientation Bezel
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const playerHtml = `
      <div class="relative flex items-center justify-center select-none">
        <span class="absolute w-12 h-12 rounded-full bg-emerald-400/20 animate-ping"></span>
        <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30"></span>

        <div class="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-800 border-2 border-white shadow-2xl flex items-center justify-center text-white">
          <svg style="transform: rotate(${bearing}deg); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);" class="w-5 h-5 text-amber-200 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      </div>
    `;

    const playerIcon = L.divIcon({
      html: playerHtml,
      className: 'player-gps-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (playerMarkerRef.current) {
      playerMarkerRef.current.setLatLng([playerLat, playerLng]);
      playerMarkerRef.current.setIcon(playerIcon);
    } else {
      playerMarkerRef.current = L.marker([playerLat, playerLng], {
        icon: playerIcon,
        zIndexOffset: 1200,
      }).addTo(map);
    }

    // Accuracy Circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng([playerLat, playerLng]);
    } else {
      accuracyCircleRef.current = L.circle([playerLat, playerLng], {
        radius: 14,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 1,
      }).addTo(map);
    }

    if (autoFollow) {
      map.panTo([playerLat, playerLng], { animate: true, duration: 0.4 });
    }
  }, [playerLat, playerLng, bearing, autoFollow]);

  // Invalidate map size on fullscreen switch
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    }
  }, [isFullscreen]);

  // Map Controls Helpers
  const centerOnPlayer = () => {
    sounds.playClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([playerLat, playerLng], 17, { duration: 0.5 });
      setAutoFollow(true);
    }
  };

  const centerOnTargetPoi = () => {
    sounds.playClick();
    if (mapInstanceRef.current && currentPoi) {
      mapInstanceRef.current.flyTo([currentPoi.lat, currentPoi.lng], 17, { duration: 0.5 });
      setAutoFollow(false);
      setSelectedPoi(currentPoi);
    }
  };

  const fitFullRoute = () => {
    sounds.playClick();
    if (!mapInstanceRef.current) return;
    const points: [number, number][] = [
      [playerLat, playerLng],
      ...session.routePoiIds
        .map((id) => forest.pois.find((p) => p.id === id))
        .filter((p): p is WindmillPOI => !!p)
        .map((p) => [p.lat, p.lng] as [number, number]),
    ];
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      setAutoFollow(false);
    }
  };

  const zoomIn = () => {
    sounds.playClick();
    mapInstanceRef.current?.zoomIn();
  };

  const zoomOut = () => {
    sounds.playClick();
    mapInstanceRef.current?.zoomOut();
  };

  // Walking simulation nudges
  const nudgeTowardsTarget = (fraction = 0.25) => {
    sounds.playClick();
    if (!currentPoi) return;
    const newLat = playerLat + (currentPoi.lat - playerLat) * fraction;
    const newLng = playerLng + (currentPoi.lng - playerLng) * fraction;
    onUpdateLocation(newLat, newLng);
  };

  const arriveAtTarget = () => {
    sounds.playClick();
    if (!currentPoi) return;
    onUpdateLocation(currentPoi.lat + 0.00007, currentPoi.lng - 0.00005);
  };

  const nudgeDirection = (dLat: number, dLng: number) => {
    sounds.playClick();
    onUpdateLocation(playerLat + dLat, playerLng + dLng);
  };

  // Organic Palette Presets
  const applyPreset = (c: number, s: number, w: number) => {
    sounds.playClick();
    setContrast(c);
    setSaturation(s);
    setWarmth(w);
    setOrganicFilterActive(true);
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-emerald-700/50 bg-[#121c15] shadow-2xl transition-all duration-300 flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none h-screen w-screen'
          : 'h-[460px] sm:h-[500px] w-full'
      }`}
    >
      {/* Sleek Top Floating HUD (Glassmorphic) */}
      <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Left: Waypoint Status Pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-emerald-600/40 shadow-xl text-stone-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-base shrink-0 shadow-inner">
            {currentPoi?.emoji || '🌲'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                Punto {session.currentPoiIndex + 1} de {session.routePoiIds.length}
              </span>
              {isNearPoi && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950 animate-pulse">
                  ¡En la zona!
                </span>
              )}
            </div>
            <h4 className="text-xs font-adventure font-bold text-stone-100 max-w-[140px] sm:max-w-[200px] truncate leading-tight">
              {currentPoi?.name || 'Siguiente hito'}
            </h4>
          </div>
        </div>

        {/* Center/Right: Target Distance & Heading Badge & Quick Layer/Filter Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Compass & Distance Dial */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-emerald-600/40 shadow-xl">
            <div className="relative w-7 h-7 rounded-full bg-black/40 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Navigation
                className="w-4 h-4 text-amber-400 drop-shadow transition-transform duration-300"
                style={{ transform: `rotate(${bearing}deg)` }}
              />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-amber-300 font-mono tabular-nums leading-none">
                {formatDistance(distanceMeters)}
              </div>
              <div className="text-[9px] font-mono text-stone-400 mt-0.5">
                Rumbo {Math.round(bearing)}° {getBearingText(bearing)}
              </div>
            </div>
          </div>

          {/* Organic Forest CSS Filter Tuning Button (Active on OpenTopoMap) */}
          {activeTheme === 'opentopo' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                title="Ajustar filtro orgánico de contraste y saturación del bosque"
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-2xl backdrop-blur-md border shadow-xl text-xs font-medium transition-all ${
                  organicFilterActive
                    ? 'bg-emerald-900/80 border-emerald-400/80 text-emerald-200'
                    : 'bg-[#142218]/90 border-stone-700 text-stone-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-bold">Filtro Orgánico</span>
                <span className="text-[10px] font-mono text-emerald-400 hidden md:inline">
                  {contrast}%/{saturation}%
                </span>
              </button>

              {/* Filter Adjustment Popover */}
              {showFilterPanel && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#121e15]/95 backdrop-blur-xl border border-emerald-600/60 shadow-2xl p-3 z-[1150] flex flex-col gap-3 text-stone-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-emerald-900/80 pb-2">
                    <div className="flex items-center gap-1.5">
                      <TreePine className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                        Paleta Orgánica de Bosque
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFilterPanel(false)}
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-tight">
                    Filtro CSS sobre OpenTopoMap para realzar curvas de nivel y frondosidad forestal.
                  </p>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset(124, 150, 8)}
                      className="px-2 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900 transition-colors text-center"
                    >
                      🌲 Vigoroso
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(116, 132, 16)}
                      className="px-2 py-1.5 rounded-xl bg-amber-950/70 border border-amber-700/60 text-[10px] font-bold text-amber-300 hover:bg-amber-900 transition-colors text-center"
                    >
                      🍂 Robledal
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(112, 126, 4)}
                      className="px-2 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-[10px] font-bold text-stone-300 hover:bg-stone-800 transition-colors text-center"
                    >
                      🌿 Natural
                    </button>
                  </div>

                  {/* Contrast Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-stone-300">Contraste de relieve:</span>
                      <span className="text-amber-300 font-bold">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  {/* Saturation Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-stone-300">Saturación de verdes:</span>
                      <span className="text-emerald-400 font-bold">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="180"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  {/* Earthy Warmth (Sepia) Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-stone-300">Calidez terrosa:</span>
                      <span className="text-amber-200 font-bold">{warmth}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={warmth}
                      onChange={(e) => setWarmth(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  {/* Toggle filter on/off */}
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-950">
                    <span className="text-[11px] text-stone-300 font-medium">Activar filtro</span>
                    <button
                      type="button"
                      onClick={() => setOrganicFilterActive(!organicFilterActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        organicFilterActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {organicFilterActive ? 'Activado' : 'Desactivado'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick AR Camera Button */}
          {onOpenAR && (
            <button
              type="button"
              onClick={onOpenAR}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-adventure text-xs font-bold shadow-lg shadow-amber-950/50 active:scale-95 transition-all shrink-0"
              title="Abrir Realidad Aumentada con cámara"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Cámara AR</span>
            </button>
          )}

          {/* Map Themes Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayersDropdown(!showLayersDropdown)}
              title="Cambiar aspecto y capa del mapa"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-emerald-600/40 hover:border-amber-400 text-stone-200 hover:text-white shadow-xl text-xs font-medium transition-all"
            >
              <span className="text-sm">{tileThemes[activeTheme].icon}</span>
              <span className="hidden md:inline text-[11px] font-bold">{tileThemes[activeTheme].shortName}</span>
              <Layers className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Dropdown Menu for Map Themes */}
            {showLayersDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121e15]/95 backdrop-blur-xl border border-emerald-600/50 shadow-2xl p-2 z-[1100] flex flex-col gap-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono border-b border-emerald-900/60 mb-1">
                  Estilo de Cartografía
                </div>
                {(Object.keys(tileThemes) as TileTheme[]).map((key) => {
                  const item = tileThemes[key];
                  const isActive = activeTheme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveTheme(key);
                        setShowLayersDropdown(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow'
                          : 'text-stone-300 hover:bg-emerald-950/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <div>{item.name}</div>
                          {key === 'opentopo' && (
                            <div className="text-[9px] text-amber-200 font-mono">Filtro orgánico activo</div>
                          )}
                        </div>
                      </div>
                      {isActive && <CheckCircle className="w-3.5 h-3.5 text-emerald-200 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsFullscreen(!isFullscreen);
            }}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}
            className="p-2 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-emerald-600/40 hover:border-amber-400 text-stone-200 hover:text-amber-300 shadow-xl transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Right Floating Quick Action Dock */}
      <div className="absolute right-3 top-16 z-[1000] flex flex-col gap-1.5">
        {/* Recenter to Player GPS */}
        <button
          type="button"
          onClick={centerOnPlayer}
          title="Centrar en mi ubicación actual"
          className="p-2.5 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-emerald-600/40 hover:border-emerald-400 text-emerald-300 hover:text-white shadow-xl hover:bg-emerald-950/80 active:scale-95 transition-all"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Recenter to Target Objective */}
        <button
          type="button"
          onClick={centerOnTargetPoi}
          title="Centrar en el objetivo del enigma"
          className="p-2.5 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-amber-600/40 hover:border-amber-400 text-amber-300 hover:text-white shadow-xl hover:bg-amber-950/80 active:scale-95 transition-all"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* Fit Entire Forest Route */}
        <button
          type="button"
          onClick={fitFullRoute}
          title="Ver ruta completa del bosque"
          className="p-2.5 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white shadow-xl hover:bg-black/60 active:scale-95 transition-all"
        >
          <Compass className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-emerald-900/60 my-0.5" />

        {/* Sleek Zoom In */}
        <button
          type="button"
          onClick={zoomIn}
          title="Acercar mapa"
          className="p-2.5 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white shadow-xl hover:bg-black/60 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Sleek Zoom Out */}
        <button
          type="button"
          onClick={zoomOut}
          title="Alejar mapa"
          className="p-2.5 rounded-2xl bg-[#142218]/90 backdrop-blur-md border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white shadow-xl hover:bg-black/60 active:scale-95 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Map Viewport with subtle organic vignette */}
      <div className="relative flex-1 w-full h-full min-h-[260px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        {/* Organic depth vignette overlay */}
        <div className="forest-map-vignette pointer-events-none" />
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none flex flex-col gap-2">
        {/* Selected POI Quick Inspection Banner (When a pin is tapped) */}
        {selectedPoi && selectedPoi.id !== currentPoi?.id && (
          <div className="pointer-events-auto bg-[#132217]/95 backdrop-blur-xl border border-emerald-600/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-stone-100 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                {selectedPoi.emoji || '📍'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-amber-300 font-mono">
                    Hito del Sendero
                  </span>
                  {session.completedPois.includes(selectedPoi.id) && (
                    <span className="text-[9px] font-bold text-emerald-400">✓ Resuelto</span>
                  )}
                </div>
                <h4 className="text-xs font-adventure font-bold text-white leading-tight">
                  {selectedPoi.name}
                </h4>
                <p className="text-[10px] text-stone-300 font-mono mt-0.5">
                  {formatCoord(selectedPoi.lat, true)} · {formatCoord(selectedPoi.lng, false)} · {formatDistance(calculateHaversineDistance(playerLat, playerLng, selectedPoi.lat, selectedPoi.lng))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {simulatedGps && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onUpdateLocation(selectedPoi.lat + 0.00008, selectedPoi.lng - 0.00006);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-[11px] font-bold transition-all shadow"
                >
                  Caminar aquí
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedPoi(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* GPS Mode & Tactile Walk Simulation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* GPS Mode Badge */}
          <div className="pointer-events-auto flex items-center gap-2 bg-[#121e15]/90 backdrop-blur-md border border-emerald-700/60 px-3 py-1.5 rounded-2xl text-xs shadow-xl">
            <span className="text-[10px] font-mono text-stone-300">Modo:</span>
            <button
              type="button"
              onClick={onToggleSimulatedGps}
              className={`px-2 py-0.5 rounded-lg font-bold text-[11px] border transition-colors ${
                simulatedGps
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              }`}
            >
              {simulatedGps ? '🎮 Simulación' : '🛰️ GPS Real'}
            </button>

            {simulatedGps && (
              <button
                type="button"
                onClick={() => setShowSimControls(!showSimControls)}
                className="text-[10px] text-amber-400 hover:underline ml-1"
              >
                {showSimControls ? 'Ocultar mandos' : 'Mandos'}
              </button>
            )}
          </div>

          {/* Walking controls in simulation mode */}
          {simulatedGps && showSimControls && (
            <div className="pointer-events-auto flex items-center gap-1.5 bg-[#121e15]/95 backdrop-blur-md border border-amber-500/50 p-1.5 rounded-2xl shadow-2xl">
              <button
                type="button"
                onClick={() => nudgeTowardsTarget(0.3)}
                className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow"
                title="Avanzar caminando hacia el punto de interés"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>+25m hacia POI</span>
              </button>

              <button
                type="button"
                onClick={arriveAtTarget}
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 rounded-xl text-xs font-adventure font-bold tracking-wide transition-all shadow"
                title="Simular que has llegado a las coordenadas del enigma"
              >
                <span>Llegar (&lt;30m)</span>
              </button>

              {/* Tactile Mini Directional Cross */}
              <div className="flex items-center gap-1 border-l border-emerald-900/80 pl-1.5">
                <button
                  type="button"
                  onClick={() => nudgeDirection(0.0001, 0)}
                  title="Avanzar al Norte (+lat)"
                  className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center justify-center transition-transform active:scale-90"
                >
                  N
                </button>
                <button
                  type="button"
                  onClick={() => nudgeDirection(-0.0001, 0)}
                  title="Avanzar al Sur (-lat)"
                  className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center justify-center transition-transform active:scale-90"
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => nudgeDirection(0, -0.0001)}
                  title="Avanzar al Oeste (-lng)"
                  className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center justify-center transition-transform active:scale-90"
                >
                  O
                </button>
                <button
                  type="button"
                  onClick={() => nudgeDirection(0, 0.0001)}
                  title="Avanzar al Este (+lng)"
                  className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center justify-center transition-transform active:scale-90"
                >
                  E
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
