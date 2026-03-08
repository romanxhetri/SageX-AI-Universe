'use client';
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";

// ============================================
// 🌌 ENHANCED VISUAL FEATURES INTEGRATION
// ============================================

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Import types and utilities from VisualEnhancements
import {
  ShipType,
  Spaceship,
  SHIP_DESIGNS,
  createSpaceshipMesh,
  Wormhole,
  createWormholeMesh,
  WeatherType,
  WeatherState,
  TimeState,
  SpaceStation,
  createSpaceStationMesh,
  calculateTimeState,
  getSkyColor,
  createMeteorShower,
  createAurora,
  SpaceshipSelector,
  WormholeOverlay,
  WeatherOverlay,
  SpaceStationOverlay,
  MeteorEventBanner
} from './VisualEnhancements';

// --- Types ---
type HubType = 'shop' | 'tools' | 'video';
type NavMode = 'cinematic' | 'pilot' | 'directory';

type HubData = {
  id: string;
  name: string;
  type: HubType;
  radius: number;
  distance: number;
  speed: number;
  color: number;
  description: string;
  icon: string;
  hasRing?: boolean;
  geometryType?: 'sphere' | 'torus' | 'icosahedron';
};

const HUBS: HubData[] = [
  { id: "mobile", name: "Mobile Hub", type: 'shop', radius: 2.0, distance: 20, speed: 0.015, color: 0x4aa3ff, description: "Latest Smartphones & Accessories", icon: "📱", geometryType: 'sphere' },
  { id: "laptop", name: "Laptop Hub", type: 'shop', radius: 2.5, distance: 35, speed: 0.012, color: 0xc0c0c0, description: "High-Performance Computing", icon: "💻", geometryType: 'sphere' },
  { id: "secondhand", name: "2nd Hand Market", type: 'shop', radius: 3.5, distance: 50, speed: 0.009, color: 0xff8844, description: "Buy, Sell, Exchange Pre-loved Items", icon: "♻️", geometryType: 'sphere' },
  { id: "products", name: "Product Hub", type: 'shop', radius: 2.8, distance: 65, speed: 0.007, color: 0x00ffcc, description: "Tech Gadgets & Essentials", icon: "🎧", geometryType: 'sphere' },
  { id: "fashion", name: "Fashion Hub", type: 'shop', radius: 3.0, distance: 80, speed: 0.005, color: 0xff66aa, description: "Virtual Try-On & Trends", icon: "👗", geometryType: 'sphere' },
  { id: "realstate", name: "Real Estate", type: 'shop', radius: 4.0, distance: 95, speed: 0.004, color: 0x22aa55, hasRing: true, description: "Property & Business Assets", icon: "🏢", geometryType: 'sphere' },
  { id: "video", name: "Video Hub", type: 'video', radius: 3.0, distance: 110, speed: 0.003, color: 0x9933ff, description: "Tutorials & Learning", icon: "🎓", geometryType: 'icosahedron' },
  { id: "tools", name: "Tools Hub", type: 'tools', radius: 2.5, distance: 125, speed: 0.002, color: 0x4444ff, description: "16+ AI Utilities Dashboard", icon: "🛠️", geometryType: 'torus' },
];

// Sample products for stations
const SAMPLE_PRODUCTS = [
  { id: "sp1", name: "Plasma Blaster", price: 2500 },
  { id: "sp2", name: "Quantum Shield", price: 5000 },
  { id: "sp3", name: "Hyperdrive Module", price: 15000 },
];

// Performance tier detection
function getPerformanceTier() {
  if (typeof navigator === 'undefined') return 'high';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 2;
  // @ts-ignore
  const memory = navigator.deviceMemory || 2;
  if (isMobile || memory <= 4 || cores <= 4) return 'low';
  return 'high';
}

// --- Main Enhanced Scene Component ---
export function EnhancedSolarSystemScene({ 
  onHubSelect, 
  isPaused, 
  mode,
  currentShip,
  onWormholeTravel,
  weather,
  timeState,
  stations,
  showWormholes = true,
  showStations = true
}: { 
  onHubSelect: (h: HubData) => void; 
  isPaused: boolean; 
  mode: NavMode;
  currentShip: Spaceship;
  onWormholeTravel?: (hubId: string) => void;
  weather: WeatherState;
  timeState: TimeState;
  stations: SpaceStation[];
  showWormholes?: boolean;
  showStations?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const simState = useRef({ isPaused, mode });
  
  const warpRef = useRef({
    active: false,
    target: new THREE.Vector3(),
    startTime: 0,
    duration: 1.5,
    startPos: new THREE.Vector3(),
    hub: null as HubData | null
  });

  const hubsRef = useRef<{ 
    mesh: THREE.Mesh, 
    data: HubData, 
    angle: number, 
    labelDiv?: HTMLDivElement 
  }[]>([]);

  const wormholesRef = useRef<Wormhole[]>([]);
  const stationsRef = useRef<{ mesh: THREE.Group; data: SpaceStation }[]>([]);
  const spaceshipRef = useRef<THREE.Group | null>(null);
  const meteorsRef = useRef<THREE.Points | null>(null);
  const auroraRef = useRef<THREE.Mesh | null>(null);
  
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  const moveState = useRef({ 
    forward: false, backward: false, left: false, right: false, up: false, down: false, 
    rotX: 0, rotY: 0,
    joyVector: new THREE.Vector2(0, 0)
  });
  
  const [isLocked, setIsLocked] = useState(false);
  const [showJoysticks, setShowJoysticks] = useState(false);

  useEffect(() => { simState.current = { isPaused, mode }; }, [isPaused, mode]);

  useEffect(() => {
    const checkTouch = () => {
      if (typeof window !== 'undefined') {
        if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window) {
          setShowJoysticks(true);
        }
      }
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch(e.code) { 
        case 'KeyW': moveState.current.forward = true; break; 
        case 'KeyS': moveState.current.backward = true; break; 
        case 'KeyA': moveState.current.left = true; break; 
        case 'KeyD': moveState.current.right = true; break; 
        case 'Space': moveState.current.up = true; break; 
        case 'ShiftLeft': moveState.current.down = true; break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
        case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8':
          // Quick travel to hubs via number keys
          const hubIndex = parseInt(e.code.replace('Digit', '')) - 1;
          if (hubIndex < HUBS.length) {
            onHubSelect(HUBS[hubIndex]);
          }
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch(e.code) { 
        case 'KeyW': moveState.current.forward = false; break; 
        case 'KeyS': moveState.current.backward = false; break; 
        case 'KeyA': moveState.current.left = false; break; 
        case 'KeyD': moveState.current.right = false; break; 
        case 'Space': moveState.current.up = false; break; 
        case 'ShiftLeft': moveState.current.down = false; break; 
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => { 
      document.removeEventListener('keydown', onKeyDown); 
      document.removeEventListener('keyup', onKeyUp); 
    };
  }, [onHubSelect]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const tier = getPerformanceTier();
    const isLowEnd = tier === 'low';
    
    // SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Dynamic sky color based on time
    const skyColor = getSkyColor(timeState);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(skyColor.getHex(), isLowEnd ? 0.001 : 0.002);
    
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    cameraRef.current = camera;
    camera.rotation.order = 'YXZ';
    camera.position.set(0, isLowEnd ? 140 : 100, isLowEnd ? 260 : 180);
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isLowEnd,
      alpha: false,
      powerPreference: "high-performance",
      precision: isLowEnd ? "mediump" : "highp",
      depth: true,
      stencil: false
    });
    rendererRef.current = renderer;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isLowEnd ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.touchAction = 'none';
    mountRef.current.appendChild(renderer.domElement);
    
    // Label container
    const labelContainer = document.createElement('div');
    labelContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;';
    mountRef.current.appendChild(labelContainer);
    
    // Controls
    let orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.autoRotate = true;
    orbitControls.autoRotateSpeed = 0.5;
    controlsRef.current = orbitControls;
    
    // Pointer lock for pilot mode
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX * 0.002;
        camera.rotation.x -= event.movementY * 0.002;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
      }
    };
    const onPointerLockChange = () => {
      setIsLocked(document.pointerLockElement === document.body);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    
    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const coreLight = new THREE.PointLight(0xffaa00, 3, 400);
    scene.add(coreLight);
    
    // Ship-specific light
    const shipLight = new THREE.PointLight(
      new THREE.Color(currentShip.color).getHex(),
      1,
      50
    );
    scene.add(shipLight);
    
    const segs = isLowEnd ? 32 : 64;

    // --- SUN ---
    const sunVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const noiseFunction = `
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        return fract(sin(dot(i, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }
    `;
    
    const sunFragmentShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      ${noiseFunction}
      void main() {
        float noiseVal = snoise(vNormal * 2.5 + time * 0.5);
        vec3 color1 = vec3(0.8, 0.2, 0.0);
        vec3 color2 = vec3(1.0, 0.8, 0.1);
        vec3 finalColor = mix(color1, color2, noiseVal * 0.5 + 0.5);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    
    const coreGeo = new THREE.SphereGeometry(10, segs, segs);
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      uniforms: { time: { value: 0 } }
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const glowGeo = new THREE.SphereGeometry(12, segs, segs);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.3 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);
    
    const haloGeo = new THREE.SphereGeometry(16, segs, segs);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: 0xff5500, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending 
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(halo);

    // --- STARS ---
    const starsGeo = new THREE.BufferGeometry();
    const starsCnt = isLowEnd ? 1500 : 4000;
    const posArray = new Float32Array(starsCnt * 3);
    const colorsArray = new Float32Array(starsCnt * 3);
    
    for (let i = 0; i < starsCnt * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 1200;
      posArray[i + 1] = (Math.random() - 0.5) * 1200;
      posArray[i + 2] = (Math.random() - 0.5) * 1200;
      const c = 0.8 + Math.random() * 0.2;
      colorsArray[i] = c;
      colorsArray[i + 1] = c;
      colorsArray[i + 2] = c;
    }
    
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    
    const starsMat = new THREE.PointsMaterial({
      size: isLowEnd ? 2.0 : 0.8,
      vertexColors: true,
      sizeAttenuation: true
    });
    const starMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starMesh);

    // --- HUBS (PLANETS) ---
    hubsRef.current = [];
    HUBS.forEach((h, i) => {
      let geo;
      if (h.geometryType === 'torus') {
        geo = new THREE.TorusGeometry(h.radius, h.radius * 0.4, isLowEnd ? 12 : 16, isLowEnd ? 24 : 32);
      } else if (h.geometryType === 'icosahedron') {
        geo = new THREE.IcosahedronGeometry(h.radius, 0);
      } else {
        geo = new THREE.SphereGeometry(h.radius, segs, segs);
      }

      const mat = new THREE.MeshLambertMaterial({
        color: h.color,
        wireframe: h.geometryType === 'icosahedron'
      });
      const mesh = new THREE.Mesh(geo, mat);
      
      if (h.hasRing) {
        const ringGeo = new THREE.RingGeometry(h.radius * 1.5, h.radius * 2.2, isLowEnd ? 24 : 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xffd700, side: THREE.DoubleSide, transparent: true, opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.rotation.y = Math.PI / 6;
        mesh.add(ring);
      }
      
      if (h.geometryType === 'icosahedron') {
        const innerGeo = new THREE.IcosahedronGeometry(h.radius * 0.6, 0);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        mesh.add(inner);
      }

      scene.add(mesh);
      
      // Orbit line
      const orbitGeo = new THREE.RingGeometry(h.distance - 0.15, h.distance + 0.15, isLowEnd ? 64 : 128);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: h.color, side: THREE.DoubleSide, transparent: true, opacity: 0.15
      });
      const orbitLine = new THREE.Mesh(orbitGeo, orbitMat);
      orbitLine.rotation.x = -Math.PI / 2;
      scene.add(orbitLine);
      
      // Label
      const label = document.createElement('div');
      label.className = 'planet-label';
      label.innerHTML = `<span style="font-size:1.2em;margin-right:4px;">${h.icon}</span> ${h.name}`;
      label.onclick = () => {
        if (warpRef.current.active) return;
        warpRef.current.active = true;
        warpRef.current.startTime = performance.now() / 1000;
        warpRef.current.startPos.copy(camera.position);
        const planetPos = new THREE.Vector3().copy(mesh.position);
        const direction = new THREE.Vector3().subVectors(camera.position, planetPos).normalize();
        warpRef.current.target.copy(planetPos).add(direction.multiplyScalar(10));
        warpRef.current.hub = h;
        controlsRef.current.enabled = false;
      };
      labelContainer.appendChild(label);
      
      hubsRef.current.push({
        mesh,
        data: h,
        angle: Math.random() * Math.PI * 2,
        labelDiv: label
      });
    });

    // --- WORMHOLES (Fast Travel Portals) ---
    if (showWormholes) {
      wormholesRef.current = [];
      HUBS.forEach((hub, i) => {
        // Create wormhole at a position between current hub and next
        const angle = (i / HUBS.length) * Math.PI * 2;
        const radius = 60;
        const position = new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.5) * 20,
          Math.sin(angle) * radius
        );
        
        const wormholeMesh = createWormholeMesh(hub.color);
        wormholeMesh.position.copy(position);
        wormholeMesh.lookAt(0, 0, 0);
        scene.add(wormholeMesh);
        
        wormholesRef.current.push({
          id: `wh-${hub.id}`,
          name: `Portal to ${hub.name}`,
          position,
          targetHubId: hub.id,
          color: hub.color,
          active: true,
          mesh: wormholeMesh
        });
      });
    }

    // --- SPACE STATIONS ---
    if (showStations && stations.length > 0) {
      stationsRef.current = [];
      stations.forEach((station, i) => {
        const stationMesh = createSpaceStationMesh(station.size);
        stationMesh.position.copy(station.position);
        scene.add(stationMesh);
        stationsRef.current.push({ mesh: stationMesh, data: station });
      });
    }

    // --- SPACESHIP ---
    const spaceship = createSpaceshipMesh(currentShip.type, currentShip.color);
    spaceship.position.copy(camera.position);
    spaceship.position.z -= 5;
    scene.add(spaceship);
    spaceshipRef.current = spaceship;

    // --- WEATHER EFFECTS ---
    if (weather.type === 'meteor-shower') {
      const meteors = createMeteorShower(scene, 50);
      scene.add(meteors);
      meteorsRef.current = meteors;
    }
    
    if (weather.type === 'aurora') {
      const aurora = createAurora();
      scene.add(aurora);
      auroraRef.current = aurora;
    }

    // --- RAYCASTER ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onClick = (e: MouseEvent) => {
      if (simState.current.mode === 'pilot' && !isLowEnd) {
        if (document.pointerLockElement !== document.body) {
          document.body.requestPointerLock();
        }
        return;
      }
      if ((e.target as HTMLElement).closest('.planet-label')) return;
      
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      // Check wormholes
      const wormholeMeshes = wormholesRef.current.map(w => w.mesh!);
      const whIntersects = raycaster.intersectObjects(wormholeMeshes, true);
      if (whIntersects.length > 0 && onWormholeTravel) {
        const hitWormhole = wormholesRef.current.find(w => 
          w.mesh === whIntersects[0].object || 
          w.mesh?.children.includes(whIntersects[0].object as any)
        );
        if (hitWormhole) {
          onWormholeTravel(hitWormhole.targetHubId);
          return;
        }
      }
      
      // Check hubs
      const hubMeshes = hubsRef.current.map(o => o.mesh);
      const intersects = raycaster.intersectObjects(hubMeshes);
      if (intersects.length > 0) {
        const hit = hubsRef.current.find(h => h.mesh === intersects[0].object);
        if (hit && !warpRef.current.active) {
          warpRef.current.active = true;
          warpRef.current.startTime = performance.now() / 1000;
          warpRef.current.startPos.copy(camera.position);
          const planetPos = new THREE.Vector3().copy(hit.mesh.position);
          const direction = new THREE.Vector3().subVectors(camera.position, planetPos).normalize();
          warpRef.current.target.copy(planetPos).add(direction.multiplyScalar(10));
          warpRef.current.hub = hit.data;
          controlsRef.current.enabled = false;
        }
      }
    };
    renderer.domElement.addEventListener('click', onClick);
    
    // Joystick handlers
    (window as any).joystickMove = (dx: number, dy: number) => {
      moveState.current.joyVector.set(dx, dy);
      moveState.current.left = dx < -0.3;
      moveState.current.right = dx > 0.3;
      moveState.current.forward = dy < -0.3;
      moveState.current.backward = dy > 0.3;
    };
    (window as any).joystickLook = (dx: number, dy: number) => {
      moveState.current.rotY = -dx * 0.03;
      moveState.current.rotX = -dy * 0.03;
    };
    
    let animationId: number;
    const tempV = new THREE.Vector3();
    const clock = new THREE.Clock();
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let elapsedTotal = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frame++;
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      elapsedTotal += delta;
      const { isPaused, mode } = simState.current;
      
      // Update sun shader
      if (coreMat.uniforms) {
        coreMat.uniforms.time.value = elapsedTime;
      }
      
      // Update wormhole shaders
      wormholesRef.current.forEach(wh => {
        if (wh.mesh) {
          wh.mesh.rotation.y += 0.01;
          wh.mesh.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
              if (child.material.uniforms && child.material.uniforms.time) {
                child.material.uniforms.time.value = elapsedTime;
              }
            }
          });
        }
      });
      
      // Update space stations
      stationsRef.current.forEach(({ mesh, data }) => {
        mesh.rotation.y += data.rotationSpeed;
        mesh.position.y += Math.sin(elapsedTime * 0.5) * 0.01;
      });
      
      // Update spaceship position to follow camera
      if (spaceshipRef.current && mode === 'pilot') {
        spaceshipRef.current.position.copy(camera.position);
        spaceshipRef.current.position.z -= 3 * currentShip.speed;
        spaceshipRef.current.rotation.copy(camera.rotation);
        
        // Engine glow based on speed
        const engine = spaceshipRef.current.getObjectByName('engine');
        if (engine && engine instanceof THREE.Mesh) {
          const material = engine.material as THREE.MeshBasicMaterial;
          const speed = moveState.current.forward ? 1.5 : 
                       moveState.current.backward ? 0.5 : 1;
          material.opacity = 0.5 + speed * 0.5;
          engine.scale.setScalar(speed);
        }
      }
      
      // Update meteors
      if (meteorsRef.current && weather.type === 'meteor-shower') {
        const positions = meteorsRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = (meteorsRef.current as any).velocities as THREE.Vector3[];
        
        for (let i = 0; i < velocities.length; i++) {
          positions[i * 3] += velocities[i].x;
          positions[i * 3 + 1] += velocities[i].y;
          positions[i * 3 + 2] += velocities[i].z;
          
          // Reset if below ground
          if (positions[i * 3 + 1] < -50) {
            positions[i * 3] = (Math.random() - 0.5) * 400;
            positions[i * 3 + 1] = 150 + Math.random() * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
          }
        }
        meteorsRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      // Update aurora
      if (auroraRef.current && weather.type === 'aurora') {
        const material = auroraRef.current.material as THREE.ShaderMaterial;
        if (material.uniforms && material.uniforms.time) {
          material.uniforms.time.value = elapsedTime;
        }
      }
      
      // Update sky color based on time
      const newSkyColor = getSkyColor(timeState);
      scene.background = newSkyColor;
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color = newSkyColor;
      }

      // Warp animation
      if (warpRef.current.active) {
        const t = (elapsedTime - warpRef.current.startTime) / warpRef.current.duration;
        const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        if (t < 1.0) {
          camera.position.lerpVectors(warpRef.current.startPos, warpRef.current.target, easeT);
          camera.lookAt(warpRef.current.hub ? 
            hubsRef.current.find(h => h.data.id === warpRef.current.hub!.id)!.mesh.position : 
            new THREE.Vector3()
          );
          
          const warpIntensity = Math.sin(t * Math.PI);
          camera.fov = 45 + (warpIntensity * 30);
          camera.updateProjectionMatrix();
        } else {
          warpRef.current.active = false;
          camera.fov = 45;
          camera.updateProjectionMatrix();
          if (warpRef.current.hub) onHubSelect(warpRef.current.hub);
          controlsRef.current.enabled = true;
        }
      }
      
      // Navigation modes
      if (mode === 'cinematic' && orbitControls && !warpRef.current.active) {
        if (moveState.current.rotX !== 0 || moveState.current.rotY !== 0) {
          orbitControls.autoRotate = false;
          const offset = new THREE.Vector3();
          offset.copy(camera.position).sub(orbitControls.target);
          const spherical = new THREE.Spherical();
          spherical.setFromVector3(offset);
          spherical.theta -= moveState.current.rotY * 0.05;
          spherical.phi -= moveState.current.rotX * 0.05;
          spherical.makeSafe();
          offset.setFromSpherical(spherical);
          camera.position.copy(orbitControls.target).add(offset);
          camera.lookAt(orbitControls.target);
        } else {
          orbitControls.autoRotate = true;
        }
        orbitControls.enabled = true;
        orbitControls.update();
      } else if (mode === 'pilot' && !warpRef.current.active) {
        if (orbitControls) orbitControls.enabled = false;
        const speed = 50 * delta * currentShip.speed;
        const velocity = new THREE.Vector3();
        
        if (moveState.current.forward) velocity.z -= speed;
        if (moveState.current.backward) velocity.z += speed;
        if (moveState.current.left) velocity.x -= speed;
        if (moveState.current.right) velocity.x += speed;
        if (moveState.current.up) velocity.y += speed;
        if (moveState.current.down) velocity.y -= speed;
        
        const joy = moveState.current.joyVector;
        if (joy.lengthSq() > 0.01) {
          velocity.x += joy.x * speed;
          velocity.z += joy.y * speed;
        }

        camera.translateX(velocity.x);
        camera.translateZ(velocity.z);
        camera.translateY(velocity.y);
        
        camera.rotateY(moveState.current.rotY);
        camera.rotateX(moveState.current.rotX);
        moveState.current.rotX *= 0.85;
        moveState.current.rotY *= 0.85;
        
        camera.rotation.z = 0;
      } else if (mode === 'directory' && orbitControls) {
        orbitControls.autoRotate = true;
        orbitControls.autoRotateSpeed = 0.2;
        orbitControls.update();
      }
      
      // Planet rotation and orbit
      if (!isPaused && !warpRef.current.active) {
        hubsRef.current.forEach(h => {
          h.angle += h.data.speed * 0.5;
          h.mesh.position.x = Math.cos(h.angle) * h.data.distance;
          h.mesh.position.z = Math.sin(h.angle) * h.data.distance;
          h.mesh.position.y = 0;
          h.mesh.rotation.y += 0.005;
          if (h.data.geometryType === 'torus' || h.data.geometryType === 'icosahedron') {
            h.mesh.rotation.x += 0.005;
          }
        });
        core.rotation.y += 0.002;
        starMesh.rotation.y -= 0.0001;
      }

      // Label positioning
      const updateFrequency = isLowEnd ? 4 : 2;
      if (frame % updateFrequency === 0 && !warpRef.current.active) {
        hubsRef.current.forEach(h => {
          if (h.labelDiv && h.mesh) {
            h.mesh.getWorldPosition(tempV);
            tempV.project(camera);
            
            if (tempV.z < 1 && tempV.z > -1) {
              const x = (tempV.x * .5 + .5) * width;
              const y = (tempV.y * -.5 + .5) * height;
              h.labelDiv.style.display = 'block';
              h.labelDiv.style.transform = `translate3d(${x.toFixed(1)}px, ${(y - 40).toFixed(1)}px, 0)`;
            } else {
              h.labelDiv.style.display = 'none';
            }
          }
        });
      } else if (warpRef.current.active) {
        hubsRef.current.forEach(h => {
          if (h.labelDiv) h.labelDiv.style.display = 'none';
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      width = window.innerWidth;
      height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
        mountRef.current.removeChild(labelContainer);
      }
      if (orbitControls) orbitControls.dispose();
      
      // Memory cleanup
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      delete (window as any).joystickMove;
      delete (window as any).joystickLook;
    };
  }, [currentShip, weather.type, timeState, stations, showWormholes, showStations, onHubSelect, onWormholeTravel]);

  const shouldShowJoysticks = showJoysticks && (mode === 'pilot' || mode === 'cinematic');

  return (
    <>
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: mode === 'pilot' ? "none" : "crosshair" }} />
      {mode === 'pilot' && !isLocked && !showJoysticks && (
        <div className="pilot-instructions">
          <h2>Pilot Mode Engaged</h2>
          <p>WASD to Move | Mouse to Look | Space/Shift to Ascend/Descend</p>
          <button className="pilot-btn" onClick={() => { document.body.requestPointerLock(); }}>
            CLICK TO START
          </button>
        </div>
      )}
      {shouldShowJoysticks && (
        <>
          <Joystick zone="left" onMove={(x, y) => (window as any).joystickMove && (window as any).joystickMove(x, y)} />
          <Joystick zone="right" onMove={(x, y) => (window as any).joystickLook && (window as any).joystickLook(x, y)} />
        </>
      )}
    </>
  );
}

// Joystick Component
function Joystick({ zone, onMove }: { zone: 'left' | 'right', onMove: (x: number, y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);

  const handleStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (touchId.current !== null) return;
    const touch = e.changedTouches[0];
    touchId.current = touch.identifier;
    update(touch);
  };
  
  const handleMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (touchId.current === null) return;
    const touch = Array.from(e.changedTouches).find((t: React.Touch) => t.identifier === touchId.current);
    if (touch) update(touch);
  };
  
  const handleEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = Array.from(e.changedTouches).find((t: React.Touch) => t.identifier === touchId.current);
    if (touch) {
      touchId.current = null;
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(-50%, -50%) translate(0px, 0px)`;
      }
      onMove(0, 0);
    }
  };
  
  const update = (touch: React.Touch) => {
    if (!ref.current || !knobRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = rect.width / 2;
    if (distance > maxDist) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDist;
      dy = Math.sin(angle) * maxDist;
    }
    knobRef.current.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    onMove(dx / maxDist, dy / maxDist);
  };

  return (
    <div
      className="joystick-zone"
      style={{ left: zone === 'left' ? '40px' : 'auto', right: zone === 'right' ? '40px' : 'auto' }}
      ref={ref}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="joystick-base"></div>
      <div className="joystick-knob" ref={knobRef}></div>
    </div>
  );
}

export default EnhancedSolarSystemScene;
