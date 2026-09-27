import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WindmillPOI, ArAssetConfig } from '../types';
import { calculateHaversineDistance, calculateBearing, formatDistance } from '../utils/geo';
import { sounds } from '../utils/audio';
import {
  Camera,
  Compass,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Eye,
  Info,
  Layers,
  Lock,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  HelpCircle,
  Smartphone,
  ShieldAlert,
  Loader2,
  MapPin,
  Move3d,
  Check
} from 'lucide-react';

interface GeolocatedARModalProps {
  isOpen: boolean;
  onClose: () => void;
  poi: WindmillPOI;
  playerLat: number;
  playerLng: number;
  isRiddleSolved: boolean;
  simulatedGps: boolean;
}

export const GeolocatedARModal: React.FC<GeolocatedARModalProps> = ({
  isOpen,
  onClose,
  poi,
  playerLat,
  playerLng,
  isRiddleSolved,
  simulatedGps,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Sensor & Device States
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [orientationPermission, setOrientationPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [devicePitch, setDevicePitch] = useState<number>(0);

  // UI States
  const [selectedAssetInfo, setSelectedAssetInfo] = useState<boolean>(false);
  const [fallback3DMode, setFallback3DMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingAsset, setLoadingAsset] = useState<boolean>(false);
  const [assetLoadError, setAssetLoadError] = useState<string | null>(null);

  // Fallback 3D Inspector Interaction
  const [manualRotationY, setManualRotationY] = useState<number>(0);
  const [manualRotationX, setManualRotationX] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const touchStartRef = useRef<{ x: number; y: number; dist?: number } | null>(null);

  const assetConfig: ArAssetConfig = poi.arAsset || {
    title: `Reliquia de ${poi.name}`,
    description: `Una proyección mística anclada a las coordenadas de ${poi.name}.`,
    revealTrigger: 'onArrival',
    scale: 1.2,
    heightOffsetMeters: 1.0,
  };

  const isUnlocked = assetConfig.revealTrigger === 'onArrival' || isRiddleSolved;

  // Haversine distance and bearing to POI
  const distanceMeters = calculateHaversineDistance(playerLat, playerLng, poi.lat, poi.lng);
  const targetBearing = calculateBearing(playerLat, playerLng, poi.lat, poi.lng);

  // Relative bearing (where the object is relative to phone's camera direction)
  let relativeAngle = (targetBearing - compassHeading) % 360;
  if (relativeAngle > 180) relativeAngle -= 360;
  if (relativeAngle < -180) relativeAngle += 360;

  const isFacingTarget = Math.abs(relativeAngle) <= 32;

  // -------------------------------------------------------------
  // Real Geolocation Accuracy Watcher
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || simulatedGps) {
      setGpsAccuracy(simulatedGps ? 4 : null);
      return;
    }

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsAccuracy(Math.round(pos.coords.accuracy));
        },
        (err) => {
          console.warn('AR Geolocation watch error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOpen, simulatedGps]);

  // -------------------------------------------------------------
  // Camera & Device Orientation Initialization
  // -------------------------------------------------------------
  const requestSensorsAndCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador no soporta acceso a cámara WebRTC o falta HTTPS');
      }

      // 1. Camera Access
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraPermission('granted');

      // 2. iOS DeviceOrientation Permission
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        // @ts-ignore iOS 13+ specific API
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          // @ts-ignore
          const res = await DeviceOrientationEvent.requestPermission();
          if (res === 'granted') {
            setOrientationPermission('granted');
            window.addEventListener('deviceorientation', handleOrientationChange, true);
          } else {
            setOrientationPermission('denied');
            setErrorMessage('Permiso de orientación denegado en iOS. La brújula no podrá rotar el objeto.');
          }
        } catch {
          setOrientationPermission('denied');
        }
      } else {
        const win = window as any;
        if ('ondeviceorientationabsolute' in win) {
          win.addEventListener('deviceorientationabsolute', handleOrientationChange, true);
          setOrientationPermission('granted');
        } else if ('ondeviceorientation' in win) {
          win.addEventListener('deviceorientation', handleOrientationChange, true);
          setOrientationPermission('granted');
        } else {
          setOrientationPermission('unsupported');
        }
      }
    } catch (err: any) {
      console.warn('Camera/Sensor access error:', err);
      setCameraPermission('denied');
      setFallback3DMode(true);
      setErrorMessage(
        'No se pudo acceder a la cámara o sensores en este dispositivo. Activando modo visor 3D táctil de reserva.'
      );
    }
  };

  const handleOrientationChange = (e: DeviceOrientationEvent) => {
    // @ts-ignore iOS webkitCompassHeading
    if (typeof e.webkitCompassHeading !== 'undefined') {
      // @ts-ignore
      setCompassHeading(Math.round(e.webkitCompassHeading));
    } else if (e.alpha !== null) {
      // Android / W3C: alpha is 0 at north if absolute, counterclockwise
      const heading = (360 - e.alpha) % 360;
      setCompassHeading(Math.round(heading));
    }

    if (e.beta !== null) {
      setDevicePitch(Math.round(e.beta));
    }
  };

  // Stop camera when closing modal
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    window.removeEventListener('deviceorientation', handleOrientationChange, true);
    // @ts-ignore
    window.removeEventListener('deviceorientationabsolute', handleOrientationChange, true);
  }, []);

  // -------------------------------------------------------------
  // Procedural 3D Forest Artifact Fallback
  // -------------------------------------------------------------
  const createProceduralArtifact = (poiId: string, scale = 1.0, preset?: string): THREE.Group => {
    const group = new THREE.Group();
    const effectivePreset = preset || '';

    if (effectivePreset === 'rueda_hidraulica' || poiId.includes('moulin')) {
      // Ancient Water Wheel
      const wheelGeom = new THREE.TorusGeometry(1.2 * scale, 0.15 * scale, 16, 32);
      const woodMat = new THREE.MeshStandardMaterial({
        color: 0x8b5a2b,
        roughness: 0.8,
        metalness: 0.1,
      });
      const wheel = new THREE.Mesh(wheelGeom, woodMat);
      wheel.rotation.y = Math.PI / 2;
      group.add(wheel);

      // Spokes
      for (let i = 0; i < 8; i++) {
        const spokeGeom = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 2.4 * scale);
        const spoke = new THREE.Mesh(spokeGeom, woodMat);
        spoke.rotation.z = (i * Math.PI) / 4;
        group.add(spoke);
      }

      // Golden Rune Hub
      const hubGeom = new THREE.CylinderGeometry(0.35 * scale, 0.35 * scale, 0.4 * scale, 16);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const hub = new THREE.Mesh(hubGeom, goldMat);
      hub.rotation.x = Math.PI / 2;
      group.add(hub);
    } else if (effectivePreset === 'cofre_sumergido' || poiId.includes('ruisseau') || poiId.includes('guerra')) {
      // Resistance Clandestine Chest
      const boxGeom = new THREE.BoxGeometry(1.4 * scale, 0.8 * scale, 0.9 * scale);
      const ironMat = new THREE.MeshStandardMaterial({
        color: 0x2b382d,
        roughness: 0.6,
        metalness: 0.5,
      });
      const chest = new THREE.Mesh(boxGeom, ironMat);
      group.add(chest);

      // Gold Lock
      const lockGeom = new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 0.1 * scale, 12);
      const lockMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 });
      const lock = new THREE.Mesh(lockGeom, lockMat);
      lock.position.set(0, 0, 0.46 * scale);
      group.add(lock);
    } else if (effectivePreset === 'espiritu_guardian' || poiId.includes('chene') || poiId.includes('soupirs')) {
      // Forest Spirit Orb
      const orbGeom = new THREE.IcosahedronGeometry(0.9 * scale, 3);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      });
      const orb = new THREE.Mesh(orbGeom, orbMat);
      group.add(orb);

      // Orbiting particles ring
      const ringGeom = new THREE.TorusGeometry(1.3 * scale, 0.04 * scale, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 3;
      group.add(ring);
    } else if (effectivePreset === 'caldero_vapor' || poiId.includes('sorciere') || poiId.includes('pont')) {
      // Witch Runic Cauldron
      const cauldronGeom = new THREE.SphereGeometry(1.0 * scale, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.7);
      const darkIronMat = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.7,
        metalness: 0.8,
      });
      const cauldron = new THREE.Mesh(cauldronGeom, darkIronMat);
      cauldron.rotation.x = Math.PI;
      group.add(cauldron);

      // Magic liquid surface
      const liquidGeom = new THREE.CircleGeometry(0.75 * scale, 24);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
      });
      const liquid = new THREE.Mesh(liquidGeom, liquidMat);
      liquid.rotation.x = -Math.PI / 2;
      liquid.position.y = 0.2 * scale;
      group.add(liquid);
    } else if (effectivePreset === 'farol_cuaderno' || poiId.includes('cabane')) {
      // Resinero Lantern
      const lanternBaseGeom = new THREE.CylinderGeometry(0.35 * scale, 0.45 * scale, 0.3 * scale, 12);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.7, roughness: 0.3 });
      const base = new THREE.Mesh(lanternBaseGeom, brassMat);
      base.position.set(-0.3 * scale, -0.4 * scale, 0);
      group.add(base);

      const glassGeom = new THREE.CylinderGeometry(0.35 * scale, 0.35 * scale, 0.7 * scale, 12);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 });
      const glass = new THREE.Mesh(glassGeom, glassMat);
      glass.position.set(-0.3 * scale, 0.1 * scale, 0);
      group.add(glass);

      // Notebook
      const bookGeom = new THREE.BoxGeometry(0.8 * scale, 0.15 * scale, 1.1 * scale);
      const leatherMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const book = new THREE.Mesh(bookGeom, leatherMat);
      book.position.set(0.4 * scale, -0.4 * scale, 0.1 * scale);
      book.rotation.y = 0.2;
      group.add(book);
    } else if (effectivePreset === 'catalejo_nautico' || poiId.includes('belvedere')) {
      // Brass Nautical Telescope
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
      const tube1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 1.6 * scale, 16), brassMat);
      tube1.rotation.x = Math.PI / 4;
      tube1.position.set(0, 0.2 * scale, 0);
      group.add(tube1);

      const lensGeom = new THREE.CircleGeometry(0.22 * scale, 16);
      const lensMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7 });
      const lens = new THREE.Mesh(lensGeom, lensMat);
      lens.position.set(0, 0.75 * scale, 0.55 * scale);
      lens.rotation.x = -Math.PI / 4;
      group.add(lens);
    } else if (effectivePreset === 'cantaro_piedra' || poiId.includes('fuente')) {
      // Limestone Fountain Pitcher
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85, metalness: 0.1 });
      const jugBody = new THREE.Mesh(new THREE.SphereGeometry(0.7 * scale, 16, 16), stoneMat);
      jugBody.scale.set(1, 1.3, 1);
      group.add(jugBody);

      const jugNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, 0.6 * scale, 16), stoneMat);
      jugNeck.position.y = 0.9 * scale;
      group.add(jugNeck);

      // Spilling water
      const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6, transparent: true, opacity: 0.8 });
      const waterStream = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.04 * scale, 1.2 * scale, 8), waterMat);
      waterStream.position.set(0.2 * scale, 0.3 * scale, 0.4 * scale);
      waterStream.rotation.x = 0.4;
      group.add(waterStream);
    } else if (effectivePreset === 'corzo_dorado' || poiId.includes('arbol')) {
      // Golden Roebuck Guardian Totem
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.25 });
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.6 * scale, 1.4 * scale, 8), goldMat);
      body.position.y = 0.1 * scale;
      group.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35 * scale, 12, 12), goldMat);
      head.position.set(0, 0.85 * scale, 0.2 * scale);
      group.add(head);

      // Antlers
      const antlerGeom = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.8 * scale, 6);
      const antlerLeft = new THREE.Mesh(antlerGeom, goldMat);
      antlerLeft.position.set(-0.25 * scale, 1.3 * scale, 0.1 * scale);
      antlerLeft.rotation.z = 0.4;
      group.add(antlerLeft);

      const antlerRight = new THREE.Mesh(antlerGeom, goldMat);
      antlerRight.position.set(0.25 * scale, 1.3 * scale, 0.1 * scale);
      antlerRight.rotation.z = -0.4;
      group.add(antlerRight);
    } else if (effectivePreset === 'halcon_bronce' || poiId.includes('mirador')) {
      // Bronzed Soaring Hawk
      const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.25 * scale, 1.0 * scale, 8), bronzeMat);
      body.rotation.x = Math.PI / 3;
      group.add(body);

      // Wings
      const wingGeom = new THREE.BoxGeometry(2.4 * scale, 0.06 * scale, 0.5 * scale);
      const wings = new THREE.Mesh(wingGeom, bronzeMat);
      wings.position.set(0, 0.2 * scale, 0);
      group.add(wings);
    } else {
      // Brass Ancient Compass (Preset: brujula_flotante or default)
      const dialGeom = new THREE.CylinderGeometry(1.1 * scale, 1.1 * scale, 0.25 * scale, 32);
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.3,
        metalness: 0.8,
      });
      const dial = new THREE.Mesh(dialGeom, brassMat);
      group.add(dial);

      // Needle
      const needleGeom = new THREE.ConeGeometry(0.18 * scale, 1.6 * scale, 8);
      const needleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 });
      const needle = new THREE.Mesh(needleGeom, needleMat);
      needle.rotation.x = Math.PI / 2;
      needle.position.y = 0.2 * scale;
      group.add(needle);
    }

    return group;
  };

  // -------------------------------------------------------------
  // Three.js Scene Setup & Render Loop
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dimensions
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // WebGL Renderer with alpha transparency to composite over camera feed
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lighting (ambient + sunny forest directionals)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.8);
    sunLight.position.set(5, 10, 7);
    scene.add(sunLight);

    const greenFillLight = new THREE.DirectionalLight(0xa7f3d0, 0.9);
    greenFillLight.position.set(-5, -2, -5);
    scene.add(greenFillLight);

    // Root artifact group
    const rootArtifactGroup = new THREE.Group();
    objectGroupRef.current = rootArtifactGroup;
    scene.add(rootArtifactGroup);

    // Initial procedural artifact as immediate representation
    let currentMesh: THREE.Object3D = createProceduralArtifact(poi.id, assetConfig.scale || 1.2, assetConfig.preset);
    rootArtifactGroup.add(currentMesh);

    // Check if custom 2D Sprite or 3D glTF Model URL is specified
    if (assetConfig.spriteUrl) {
      setLoadingAsset(true);
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        assetConfig.spriteUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
          const sprite = new THREE.Sprite(spriteMat);
          const s = (assetConfig.scale || 1.2) * 2.5;
          sprite.scale.set(s, s, 1);
          rootArtifactGroup.clear();
          rootArtifactGroup.add(sprite);
          setLoadingAsset(false);
          setAssetLoadError(null);
        },
        undefined,
        (err) => {
          console.warn('Error loading sprite image:', err);
          setLoadingAsset(false);
          setAssetLoadError('No se pudo cargar el sprite remoto. Mostrando reliquia procedural.');
        }
      );
    } else if (assetConfig.modelUrl) {
      setLoadingAsset(true);
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        assetConfig.modelUrl,
        (gltf) => {
          const model = gltf.scene;
          const s = assetConfig.scale || 1.2;
          model.scale.set(s, s, s);

          // Center the loaded model pivot
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);

          const wrapper = new THREE.Group();
          wrapper.add(model);

          rootArtifactGroup.clear();
          rootArtifactGroup.add(wrapper);
          setLoadingAsset(false);
          setAssetLoadError(null);
        },
        undefined,
        (err) => {
          console.warn('Error loading glTF model:', err);
          setLoadingAsset(false);
          setAssetLoadError('Error al descargar el modelo 3D glTF. Mostrando reliquia procedural.');
        }
      );
    }

    // Handle resize
    const handleResize = () => {
      if (!canvas || !renderer || !camera) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (rootArtifactGroup) {
        const bobbing = Math.sin(elapsedTime * 2) * 0.12;

        if (fallback3DMode) {
          // Manual 3D Inspector Mode
          rootArtifactGroup.position.set(
            0,
            (assetConfig.heightOffsetMeters || 1.0) - 1.0 + bobbing,
            -3.5 / zoomLevel
          );
          rootArtifactGroup.rotation.y = manualRotationY + elapsedTime * 0.25;
          rootArtifactGroup.rotation.x = manualRotationX;
        } else {
          // Reset rotation for standard geo alignment
          rootArtifactGroup.rotation.x = 0;
          rootArtifactGroup.rotation.y += 0.015;

          // Geolocated AR Mode:
          // Project object into 3D camera space based on relative azimuth (targetBearing - compassHeading)
          const relRad = THREE.MathUtils.degToRad(relativeAngle);
          // Clamp virtual distance between 3.2m and 16m for optimal mobile viewport presence
          const visualDistance = Math.min(Math.max(distanceMeters * 0.35, 3.2), 16.0);

          const posX = Math.sin(relRad) * visualDistance;
          const posZ = -Math.cos(relRad) * visualDistance;
          const posY = (assetConfig.heightOffsetMeters || 1.2) - 0.5 + bobbing;

          rootArtifactGroup.position.set(posX, posY, posZ);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      stopCameraStream();
    };
  }, [isOpen, fallback3DMode, relativeAngle, distanceMeters, manualRotationY, manualRotationX, zoomLevel]);

  // Touch drag for manual 3D inspector rotation and pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 1 && !touchStartRef.current.dist) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      setManualRotationY((prev) => prev + deltaX * 0.012);
      setManualRotationX((prev) => Math.max(-Math.PI / 4, Math.min(Math.PI / 4, prev + deltaY * 0.008)));
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && touchStartRef.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / touchStartRef.current.dist;
      setZoomLevel((prev) => Math.max(0.6, Math.min(2.5, prev * ratio)));
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden select-none animate-in fade-in duration-200">
      {/* Background Video Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          fallback3DMode ? 'opacity-25 blur-sm' : 'opacity-100'
        }`}
      />

      {/* Fallback forest background gradient when camera is unavailable or in 3D inspector */}
      {fallback3DMode && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#142316] via-[#0E1A11] to-[#070D08] -z-10" />
      )}

      {/* When in fallback 3D mode AND a .glb/.gltf model is available, support native <model-viewer> */}
      {fallback3DMode && assetConfig.modelUrl ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          {React.createElement(
            'model-viewer',
            {
              src: assetConfig.modelUrl,
              alt: assetConfig.title || poi.name,
              ar: true,
              'ar-modes': 'webxr scene-viewer quick-look',
              'camera-controls': true,
              'touch-action': 'pan-y',
              'auto-rotate': true,
              'shadow-intensity': '1',
              style: { width: '100%', height: '100%' },
            },
            <button
              slot="ar-button"
              className="absolute bottom-24 right-6 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-adventure font-bold text-xs rounded-xl shadow-2xl flex items-center gap-2 transition-transform active:scale-95"
            >
              <Move3d className="w-4 h-4 text-stone-950" />
              <span>Colocar en el Suelo (AR)</span>
            </button>
          )}
        </div>
      ) : (
        /* Three.js WebGL Overlay Canvas */
        <canvas
          ref={canvasRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="absolute inset-0 w-full h-full z-10 cursor-grab active:cursor-grabbing"
        />
      )}

      {/* TOP HUD BAR */}
      <header className="relative z-30 p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between gap-3 text-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-lg shrink-0">
            {poi.emoji || '✨'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-amber-300 font-mono tracking-wider">
                Realidad Aumentada
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold">
                {fallback3DMode ? 'Modo Visor 3D' : 'Geo-Anclado'}
              </span>
            </div>
            <h3 className="font-adventure text-base font-bold text-stone-100 drop-shadow">
              {assetConfig.title || poi.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle mode: AR Geolocated vs 3D Inspector */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setFallback3DMode(!fallback3DMode);
            }}
            className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-stone-600 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all shadow"
            title={fallback3DMode ? 'Volver a modo cámara AR con GPS' : 'Modo reserva 3D libre sin brújula'}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{fallback3DMode ? 'Cámara AR' : 'Modo Reserva 3D'}</span>
          </button>

          {/* Close AR View */}
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 border border-stone-600 text-stone-300 hover:text-white backdrop-blur-md transition-colors shadow"
            title="Cerrar Realidad Aumentada"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Asset Loading Indicator */}
      {loadingAsset && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/75 backdrop-blur-md border border-amber-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs text-amber-200 shadow-xl">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Cargando artefacto 3D / sprite...</span>
        </div>
      )}

      {/* Load error message if any */}
      {assetLoadError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-950/90 border border-amber-600/70 px-4 py-2 rounded-2xl text-[11px] text-amber-200 flex items-center gap-2 shadow-xl max-w-sm text-center">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{assetLoadError}</span>
        </div>
      )}

      {/* DIRECTIONAL RADAR & COMPASS GUIDE (Mitigación forestal obligatoria) */}
      {!fallback3DMode && (
        <div className="relative z-30 px-4 pt-1 pb-2 flex flex-col items-center pointer-events-none">
          {/* Dynamic Guidance Banner */}
          <div className="bg-black/80 backdrop-blur-md border border-amber-500/40 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl text-xs max-w-md w-full">
            {/* Rotating Arrow Indicator */}
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md transition-transform duration-300 shrink-0"
              style={{ transform: `rotate(${relativeAngle}deg)` }}
            >
              <Compass className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                {isFacingTarget ? (
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>¡Artefacto en tu campo visual!</span>
                  </span>
                ) : relativeAngle > 0 ? (
                  <span className="text-amber-300">
                    Gira {Math.abs(Math.round(relativeAngle))}° a tu derecha ➔
                  </span>
                ) : (
                  <span className="text-amber-300">
                    ⬅ Gira {Math.abs(Math.round(relativeAngle))}° a tu izquierda
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-300 font-mono flex items-center justify-between">
                <span>Distancia: <strong>{formatDistance(distanceMeters)}</strong></span>
                <span>Rumbo: {Math.round(targetBearing)}°</span>
              </div>
            </div>
          </div>

          {/* GPS Accuracy Indicator & Forest Canopy Warning */}
          <div className="mt-2 flex items-center gap-2">
            {gpsAccuracy !== null && (
              <div
                className={`px-3 py-1 rounded-xl text-[11px] flex items-center gap-1.5 shadow-md ${
                  gpsAccuracy <= 10
                    ? 'bg-emerald-950/90 border border-emerald-600/70 text-emerald-200'
                    : gpsAccuracy <= 20
                    ? 'bg-stone-900/90 border border-amber-600/60 text-amber-200'
                    : 'bg-amber-950/90 border border-amber-500 text-amber-100'
                }`}
              >
                {gpsAccuracy <= 15 ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span>
                  {gpsAccuracy <= 10
                    ? `GPS Preciso: ±${gpsAccuracy}m`
                    : gpsAccuracy <= 20
                    ? `GPS Moderado (árboles): ±${gpsAccuracy}m`
                    : `Señal GPS débil bajo los árboles (±${gpsAccuracy}m). El objeto puede aparecer desplazado.`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CENTER LOCKED OVERLAY (If revealTrigger === 'onRiddleSolved' and not yet solved) */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/65 backdrop-blur-sm pointer-events-auto">
          <div className="max-w-md w-full bg-[#18281B] border border-amber-600/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-adventure text-lg sm:text-xl font-bold text-amber-100">
                Aparición Protegida por Enigma
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                Este artefacto permanece velado por el misterio del bosque. Resuelve primero el acertijo de <strong>{poi.name}</strong> para que la energía de la senda revele la reliquia en realidad aumentada.
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-stone-800 text-[11px] text-stone-400 text-left space-y-1">
              <div className="flex items-center gap-1 font-semibold text-emerald-400">
                <Info className="w-3.5 h-3.5" />
                <span>Nota sobre el avance:</span>
              </div>
              <p>
                El avance en la aventura depende de resolver el enigma. El AR es una recompensa visual que se activa tras contestar correctamente.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 text-white font-adventure text-xs font-bold tracking-wider transition-all shadow-lg"
            >
              Volver al Enigma
            </button>
          </div>
        </div>
      )}

      {/* INITIAL PERMISSIONS PROMPT (If camera not yet granted) */}
      {cameraPermission === 'prompt' && isUnlocked && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full bg-gradient-to-b from-[#1C2C1E] to-[#121E14] border border-emerald-600/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5 text-stone-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mx-auto shadow-inner">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-adventure text-xl sm:text-2xl font-bold text-amber-100">
                Activar Realidad Aumentada
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                Apunta con la cámara de tu móvil hacia el bosque. Superpondremos el artefacto 3D de <strong>{poi.name}</strong> anclado en sus coordenadas GPS reales.
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-stone-800 text-[11px] text-stone-400 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Info className="w-3.5 h-3.5" />
                <span>Experiencia visual sin bloqueos:</span>
              </div>
              <p>
                El AR es una capa visual y narrativa. Si el bosque no tiene cobertura o prefieres no encender la cámara, puedes resolver el enigma sin problemas o usar el visor 3D de reserva.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setFallback3DMode(true);
                  setCameraPermission('granted');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-700 bg-stone-900/60 hover:bg-stone-800 text-stone-300 text-xs font-bold transition-all"
              >
                Modo 3D sin cámara
              </button>
              <button
                type="button"
                onClick={requestSensorsAndCamera}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-adventure text-xs font-bold tracking-wider shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Iniciar Cámara AR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION & INSPECTION STRIP */}
      <footer className="relative z-30 mt-auto p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playSuccess();
              setSelectedAssetInfo(!selectedAssetInfo);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-green-900 hover:from-emerald-700 hover:to-green-800 border border-emerald-500/60 text-white font-adventure text-xs font-bold shadow-lg shadow-emerald-950/80 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Examinar {assetConfig.title || 'Artefacto'}</span>
          </button>

          {fallback3DMode && (
            <span className="text-[11px] text-stone-400 italic">
              Arrastra para rotar • Pellizca para zoom
            </span>
          )}
        </div>

        {/* Coords & Altitude details */}
        <div className="text-[11px] text-stone-400 font-mono text-center sm:text-right">
          <div>POI: {poi.lat.toFixed(5)}° N, {poi.lng.toFixed(5)}° E</div>
          <div className="text-amber-400/90">
            Elevación: +{assetConfig.heightOffsetMeters || 1.0}m sobre el suelo
          </div>
        </div>
      </footer>

      {/* ARTIFACT LORE & CLUE INSPECTION MODAL */}
      {selectedAssetInfo && (
        <div className="absolute inset-x-4 bottom-20 z-40 max-w-lg mx-auto bg-[#17271B] border-2 border-amber-500/70 rounded-2xl p-5 shadow-2xl text-stone-100 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                {poi.emoji || '🔮'}
              </div>
              <div>
                <h4 className="font-adventure text-base font-bold text-amber-100">
                  {assetConfig.title || poi.name}
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Anclado en {poi.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAssetInfo(false)}
              className="p-1 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-stone-200 mt-3 leading-relaxed">
            {assetConfig.description || poi.description}
          </p>

          {poi.clueSnippet && (
            <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-emerald-800/60 text-xs text-amber-200 flex items-start gap-2">
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Pista visual para el enigma: </strong>
                <span>{poi.clueSnippet}</span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-emerald-900/60 flex items-center justify-between text-[11px] text-stone-400">
            <span>¿Lo ves flotando en el bosque?</span>
            <button
              type="button"
              onClick={() => setSelectedAssetInfo(false)}
              className="font-bold text-amber-400 hover:underline"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
