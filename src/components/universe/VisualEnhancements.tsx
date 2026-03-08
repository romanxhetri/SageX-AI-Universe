'use client';
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ============================================
// 🚀 SPACESHIP SYSTEM
// ============================================

export type ShipType = 'scout' | 'fighter' | 'cruiser' | 'dreadnought' | 'phantom';

export interface Spaceship {
  id: string;
  name: string;
  type: ShipType;
  color: string;
  speed: number;
  handling: number;
  shield: number;
  unlocked: boolean;
  achievementRequired?: string;
  mesh?: THREE.Group;
}

export const SHIP_DESIGNS: Record<ShipType, {
  name: string;
  color: string;
  speed: number;
  handling: number;
  shield: number;
  achievement: string;
  description: string;
}> = {
  scout: {
    name: "Stellar Scout",
    color: "#00f2ff",
    speed: 1.5,
    handling: 1.2,
    shield: 50,
    achievement: "Welcome to the Universe",
    description: "Fast and agile starter ship"
  },
  fighter: {
    name: "Nebula Fighter",
    color: "#ff4444",
    speed: 1.8,
    handling: 1.0,
    shield: 75,
    achievement: "First Purchase",
    description: "Balanced combat-ready vessel"
  },
  cruiser: {
    name: "Cosmic Cruiser",
    color: "#44ff44",
    speed: 1.2,
    handling: 0.8,
    shield: 150,
    achievement: "10 Items in Cart",
    description: "Heavy cargo hauler"
  },
  dreadnought: {
    name: "Void Dreadnought",
    color: "#9933ff",
    speed: 1.0,
    handling: 0.6,
    shield: 300,
    achievement: "Spend 1,000,000 Credits",
    description: "Ultimate battleship"
  },
  phantom: {
    name: "Shadow Phantom",
    color: "#ffffff",
    speed: 2.0,
    handling: 1.5,
    shield: 100,
    achievement: "Visit All Hubs",
    description: "Stealth reconnaissance ship"
  }
};

export function createSpaceshipMesh(type: ShipType, color: string): THREE.Group {
  const group = new THREE.Group();
  
  // Main body
  const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 8);
  const bodyMaterial = new THREE.MeshPhongMaterial({ 
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.3,
    shininess: 100
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.x = Math.PI / 2;
  group.add(body);
  
  // Wings
  const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
  const wingMaterial = new THREE.MeshPhongMaterial({ 
    color: new THREE.Color(color).multiplyScalar(0.7),
    metalness: 0.8
  });
  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.position.set(-0.8, 0, -0.3);
  leftWing.rotation.z = -0.2;
  group.add(leftWing);
  
  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.position.set(0.8, 0, -0.3);
  rightWing.rotation.z = 0.2;
  group.add(rightWing);
  
  // Engine glow
  const engineGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const engineMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8
  });
  const engine = new THREE.Mesh(engineGeometry, engineMaterial);
  engine.position.set(0, 0, -1);
  engine.name = 'engine';
  group.add(engine);
  
  // Cockpit
  const cockpitGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const cockpitMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    shininess: 150
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(0, 0.1, 0.5);
  group.add(cockpit);
  
  // Add unique features based on ship type
  if (type === 'fighter' || type === 'dreadnought') {
    // Add cannons
    const cannonGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8);
    const cannonMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const leftCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    leftCannon.position.set(-0.4, -0.1, 0.8);
    leftCannon.rotation.x = Math.PI / 2;
    group.add(leftCannon);
    
    const rightCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    rightCannon.position.set(0.4, -0.1, 0.8);
    rightCannon.rotation.x = Math.PI / 2;
    group.add(rightCannon);
  }
  
  if (type === 'cruiser' || type === 'dreadnought') {
    // Add cargo pods
    const podGeometry = new THREE.CapsuleGeometry(0.15, 0.4, 4, 8);
    const podMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const leftPod = new THREE.Mesh(podGeometry, podMaterial);
    leftPod.position.set(-0.6, 0, -0.5);
    group.add(leftPod);
    
    const rightPod = new THREE.Mesh(podGeometry, podMaterial);
    rightPod.position.set(0.6, 0, -0.5);
    group.add(rightPod);
  }
  
  return group;
}

// ============================================
// 🌀 WORMHOLE PORTAL SYSTEM
// ============================================

export interface Wormhole {
  id: string;
  name: string;
  position: THREE.Vector3;
  targetHubId: string;
  color: number;
  active: boolean;
  mesh?: THREE.Group;
}

const wormholeVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    float wave = sin(pos.x * 5.0 + time * 2.0) * 0.1;
    wave += sin(pos.y * 3.0 + time * 1.5) * 0.1;
    pos.z += wave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const wormholeFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    float swirl = sin(atan(vPosition.y, vPosition.x) * 5.0 + time * 3.0);
    float dist = length(vPosition.xy);
    float alpha = 1.0 - smoothstep(0.0, 1.5, dist);
    
    vec3 finalColor = mix(color1, color2, swirl * 0.5 + 0.5);
    finalColor += vec3(0.2, 0.1, 0.3) * (sin(time * 5.0) * 0.5 + 0.5);
    
    gl_FragColor = vec4(finalColor, alpha * 0.8);
  }
`;

export function createWormholeMesh(color: number): THREE.Group {
  const group = new THREE.Group();
  
  // Inner portal
  const portalGeometry = new THREE.TorusGeometry(1.5, 0.3, 32, 64);
  const portalMaterial = new THREE.ShaderMaterial({
    vertexShader: wormholeVertexShader,
    fragmentShader: wormholeFragmentShader,
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(color) },
      color2: { value: new THREE.Color(0xffffff) }
    },
    transparent: true,
    side: THREE.DoubleSide
  });
  const portal = new THREE.Mesh(portalGeometry, portalMaterial);
  group.add(portal);
  
  // Outer ring
  const ringGeometry = new THREE.TorusGeometry(2, 0.1, 16, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({ 
    color: color,
    transparent: true,
    opacity: 0.5
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.name = 'outerRing';
  group.add(ring);
  
  // Particle field around wormhole
  const particleCount = 100;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.5 + Math.random() * 1;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: color,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.name = 'particles';
  group.add(particles);
  
  return group;
}

// ============================================
// 🌤️ WEATHER & TIME SYSTEM
// ============================================

export type WeatherType = 'clear' | 'nebula' | 'meteor-shower' | 'aurora' | 'solar-flare';

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  duration: number;
  startTime: number;
}

export interface TimeState {
  hour: number;
  dayProgress: number; // 0-1
  isDay: boolean;
}

export function calculateTimeState(elapsedSeconds: number, speedMultiplier: number = 0.1): TimeState {
  // One full day cycle = 10 minutes real time
  const dayDuration = 600 / speedMultiplier;
  const dayProgress = (elapsedSeconds % dayDuration) / dayDuration;
  const hour = Math.floor(dayProgress * 24);
  
  return {
    hour,
    dayProgress,
    isDay: hour >= 6 && hour < 18
  };
}

export function getSkyColor(timeState: TimeState): THREE.Color {
  const { hour, isDay, dayProgress } = timeState;
  
  if (hour >= 5 && hour < 7) {
    // Dawn
    return new THREE.Color(0xff6644).lerp(new THREE.Color(0x4488ff), (hour - 5) / 2);
  } else if (hour >= 7 && hour < 17) {
    // Day
    return new THREE.Color(0x4488ff);
  } else if (hour >= 17 && hour < 19) {
    // Dusk
    return new THREE.Color(0x4488ff).lerp(new THREE.Color(0xff4444), (hour - 17) / 2);
  } else {
    // Night
    return new THREE.Color(0x020205);
  }
}

export function createMeteorShower(scene: THREE.Scene, count: number = 50): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities: THREE.Vector3[] = [];
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 1] = 150 + Math.random() * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      -Math.random() * 3 - 1,
      (Math.random() - 0.5) * 2
    ));
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 1.5,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  
  const meteors = new THREE.Points(geometry, material);
  (meteors as any).velocities = velocities;
  meteors.name = 'meteorShower';
  
  return meteors;
}

export function createAurora(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(300, 100, 50, 50);
  
  const auroraVertexShader = `
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.z += sin(pos.x * 0.05 + time) * 5.0;
      pos.z += cos(pos.y * 0.03 + time * 0.7) * 3.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;
  
  const auroraFragmentShader = `
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vec3 color1 = vec3(0.0, 1.0, 0.5);
      vec3 color2 = vec3(0.5, 0.0, 1.0);
      vec3 color3 = vec3(0.0, 0.5, 1.0);
      
      float wave = sin(vUv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
      vec3 finalColor = mix(color1, color2, wave);
      finalColor = mix(finalColor, color3, sin(vUv.y * 5.0 + time) * 0.5 + 0.5);
      
      float alpha = (1.0 - vUv.y) * 0.5 * (sin(vUv.x * 20.0 + time * 3.0) * 0.3 + 0.7);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;
  
  const material = new THREE.ShaderMaterial({
    vertexShader: auroraVertexShader,
    fragmentShader: auroraFragmentShader,
    uniforms: {
      time: { value: 0 }
    },
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  
  const aurora = new THREE.Mesh(geometry, material);
  aurora.position.set(0, 80, -100);
  aurora.rotation.x = -Math.PI / 4;
  aurora.name = 'aurora';
  
  return aurora;
}

// ============================================
// 🛰️ SPACE STATIONS
// ============================================

export interface SpaceStation {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  position: THREE.Vector3;
  rotationSpeed: number;
  size: number;
  products: string[];
  rating: number;
  mesh?: THREE.Group;
}

export function createSpaceStationMesh(size: number = 1): THREE.Group {
  const group = new THREE.Group();
  
  // Main module (central hub)
  const hubGeometry = new THREE.CylinderGeometry(2 * size, 2 * size, 4 * size, 16);
  const hubMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x888899,
    metalness: 0.8,
    shininess: 50
  });
  const hub = new THREE.Mesh(hubGeometry, hubMaterial);
  hub.rotation.x = Math.PI / 2;
  group.add(hub);
  
  // Living ring
  const ringGeometry = new THREE.TorusGeometry(5 * size, 1.5 * size, 8, 32);
  const ringMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x667788,
    metalness: 0.6
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.name = 'livingRing';
  group.add(ring);
  
  // Solar panels
  const panelGeometry = new THREE.BoxGeometry(8 * size, 0.1 * size, 3 * size);
  const panelMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2244aa,
    emissive: 0x112244,
    emissiveIntensity: 0.3
  });
  
  const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  leftPanel.position.set(-6 * size, 0, 0);
  group.add(leftPanel);
  
  const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  rightPanel.position.set(6 * size, 0, 0);
  group.add(rightPanel);
  
  // Docking ports
  const dockGeometry = new THREE.CylinderGeometry(0.5 * size, 0.5 * size, 2 * size, 8);
  const dockMaterial = new THREE.MeshPhongMaterial({ color: 0x444455 });
  
  const dock1 = new THREE.Mesh(dockGeometry, dockMaterial);
  dock1.position.set(0, 0, 3 * size);
  group.add(dock1);
  
  const dock2 = new THREE.Mesh(dockGeometry, dockMaterial);
  dock2.position.set(0, 0, -3 * size);
  group.add(dock2);
  
  // Antenna
  const antennaGeometry = new THREE.ConeGeometry(0.3 * size, 2 * size, 8);
  const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  antenna.position.set(0, 3 * size, 0);
  group.add(antenna);
  
  // Communication dish
  const dishGeometry = new THREE.SphereGeometry(1 * size, 16, 8, 0, Math.PI);
  const dishMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xcccccc,
    side: THREE.DoubleSide
  });
  const dish = new THREE.Mesh(dishGeometry, dishMaterial);
  dish.position.set(0, 2 * size, 2 * size);
  dish.rotation.x = Math.PI / 4;
  group.add(dish);
  
  // Lights
  const lightGeometry = new THREE.SphereGeometry(0.15 * size, 8, 8);
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(
      Math.cos(angle) * 5 * size,
      0,
      Math.sin(angle) * 5 * size
    );
    light.name = `statusLight_${i}`;
    group.add(light);
  }
  
  return group;
}

// ============================================
// UI Components
// ============================================

export function SpaceshipSelector({ 
  ships, 
  currentShip, 
  onSelect, 
  achievements 
}: { 
  ships: Spaceship[];
  currentShip: Spaceship;
  onSelect: (ship: Spaceship) => void;
  achievements: string[];
}) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 20, 40, 0.95)',
      border: '2px solid #00f2ff',
      borderRadius: '20px',
      padding: '30px',
      zIndex: 200,
      minWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: '#00f2ff',
        textTransform: 'uppercase',
        letterSpacing: '3px'
      }}>
        🚀 Hangar Bay
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {Object.entries(SHIP_DESIGNS).map(([type, design]) => {
          const isUnlocked = achievements.includes(design.achievement);
          const isSelected = currentShip.type === type;
          
          return (
            <div
              key={type}
              onClick={() => isUnlocked && onSelect({ 
                ...ships.find(s => s.type === type)!,
                type: type as ShipType,
                ...design 
              })}
              style={{
                background: isSelected ? 'rgba(0, 242, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                border: isSelected ? '2px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '15px',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.5,
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                margin: '0 auto 10px',
                background: `linear-gradient(135deg, ${design.color}44, ${design.color}22)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🚀
              </div>
              
              <div style={{ 
                fontWeight: 'bold', 
                textAlign: 'center',
                color: design.color,
                marginBottom: '5px'
              }}>
                {design.name}
              </div>
              
              <div style={{ 
                fontSize: '0.75rem', 
                textAlign: 'center',
                color: '#888',
                marginBottom: '10px'
              }}>
                {design.description}
              </div>
              
              <div style={{ fontSize: '0.7rem', color: '#666' }}>
                <div>⚡ Speed: {'⭐'.repeat(Math.round(design.speed))}</div>
                <div>🎮 Handling: {'⭐'.repeat(Math.round(design.handling))}</div>
                <div>🛡️ Shield: {design.shield}</div>
              </div>
              
              {!isUnlocked && (
                <div style={{
                  marginTop: '10px',
                  padding: '5px',
                  background: 'rgba(255,100,100,0.2)',
                  borderRadius: '5px',
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  color: '#ff6666'
                }}>
                  🔒 {design.achievement}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WormholeOverlay({
  wormholes,
  onTravel,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  currentHub
}: {
  wormholes: Wormhole[];
  onTravel: (wormhole: Wormhole) => void;
  bookmarks: string[];
  onAddBookmark: (hubId: string) => void;
  onRemoveBookmark: (hubId: string) => void;
  currentHub?: string;
}) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
      background: 'rgba(0, 20, 40, 0.9)',
      border: '1px solid rgba(0, 242, 255, 0.5)',
      borderRadius: '15px',
      padding: '20px',
      zIndex: 150,
      minWidth: '250px'
    }}>
      <h3 style={{
        color: '#00f2ff',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        🌀 Wormhole Network
      </h3>
      
      <div style={{
        maxHeight: '300px',
        overflow: 'auto',
        marginBottom: '15px'
      }}>
        {wormholes.map(wh => (
          <div
            key={wh.id}
            onClick={() => onTravel(wh)}
            style={{
              padding: '10px',
              marginBottom: '8px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `#${wh.color.toString(16).padStart(6, '0')}`;
              e.currentTarget.style.background = 'rgba(0, 242, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{wh.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
              → {wh.targetHubId.toUpperCase()} Hub
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '15px'
      }}>
        <h4 style={{ color: '#ffaa00', marginBottom: '10px', fontSize: '0.9rem' }}>
          ⭐ Saved Coordinates
        </h4>
        
        {bookmarks.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            No saved coordinates yet
          </div>
        ) : (
          bookmarks.map(hubId => (
            <div
              key={hubId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                background: 'rgba(255, 170, 0, 0.1)',
                borderRadius: '5px',
                marginBottom: '5px'
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>{hubId}</span>
              <button
                onClick={() => onRemoveBookmark(hubId)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6666',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
        
        {currentHub && !bookmarks.includes(currentHub) && (
          <button
            onClick={() => onAddBookmark(currentHub)}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '8px',
              background: 'rgba(255, 170, 0, 0.2)',
              border: '1px solid #ffaa00',
              borderRadius: '5px',
              color: '#ffaa00',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            + Save Current Location
          </button>
        )}
      </div>
    </div>
  );
}

export function WeatherOverlay({
  weather,
  timeState,
  onTriggerEvent
}: {
  weather: WeatherState;
  timeState: TimeState;
  onTriggerEvent?: (type: WeatherType) => void;
}) {
  const weatherIcons: Record<WeatherType, string> = {
    'clear': '☀️',
    'nebula': '🌌',
    'meteor-shower': '☄️',
    'aurora': '🌈',
    'solar-flare': '🔥'
  };
  
  const weatherColors: Record<WeatherType, string> = {
    'clear': '#ffdd00',
    'nebula': '#9933ff',
    'meteor-shower': '#ff6600',
    'aurora': '#00ff88',
    'solar-flare': '#ff3300'
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '20px',
      background: 'rgba(0, 20, 40, 0.8)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '15px',
      zIndex: 100,
      minWidth: '180px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <span style={{ fontSize: '1.5rem' }}>
          {timeState.isDay ? '☀️' : '🌙'}
        </span>
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {timeState.hour.toString().padStart(2, '0')}:00
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>
            {timeState.isDay ? 'Day Time' : 'Night Time'}
          </div>
        </div>
      </div>
      
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.5rem' }}>
          {weatherIcons[weather.type]}
        </span>
        <div>
          <div style={{ 
            fontWeight: 'bold',
            color: weatherColors[weather.type],
            textTransform: 'capitalize'
          }}>
            {weather.type.replace('-', ' ')}
          </div>
          {weather.type === 'meteor-shower' && (
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#ff6600',
              animation: 'pulse 1s infinite'
            }}>
              🔥 FLASH SALE ACTIVE!
            </div>
          )}
        </div>
      </div>
      
      {/* Day/night progress bar */}
      <div style={{
        marginTop: '10px',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${timeState.dayProgress * 100}%`,
          height: '100%',
          background: timeState.isDay 
            ? 'linear-gradient(90deg, #ffdd00, #ff8800)'
            : 'linear-gradient(90deg, #334488, #112244)',
          transition: 'width 0.5s'
        }} />
      </div>
    </div>
  );
}

export function SpaceStationOverlay({
  stations,
  onSelect,
  onCreate
}: {
  stations: SpaceStation[];
  onSelect: (station: SpaceStation) => void;
  onCreate?: () => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      left: '20px',
      background: 'rgba(0, 20, 40, 0.9)',
      border: '1px solid rgba(100, 200, 255, 0.3)',
      borderRadius: '12px',
      padding: '15px',
      zIndex: 100,
      minWidth: '220px'
    }}>
      <h3 style={{
        color: '#66ccff',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.95rem'
      }}>
        🛰️ Trading Posts
      </h3>
      
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {stations.map(station => (
          <div
            key={station.id}
            onClick={() => onSelect(station)}
            style={{
              padding: '10px',
              marginBottom: '8px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(100, 200, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {station.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
              by {station.ownerName}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#ffaa00',
              marginTop: '4px'
            }}>
              {'⭐'.repeat(Math.round(station.rating))} ({station.products.length} items)
            </div>
          </div>
        ))}
      </div>
      
      {onCreate && (
        <button
          onClick={onCreate}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '10px',
            background: 'linear-gradient(135deg, #2244aa, #4466cc)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          🏗️ Create Your Station
        </button>
      )}
    </div>
  );
}

export function MeteorEventBanner({ 
  active, 
  discount, 
  timeLeft 
}: { 
  active: boolean;
  discount: number;
  timeLeft: number;
}) {
  if (!active) return null;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  
  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(90deg, rgba(255,100,0,0.9), rgba(255,50,0,0.9))',
      padding: '12px 30px',
      borderRadius: '30px',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      boxShadow: '0 0 30px rgba(255,100,0,0.5)',
      animation: 'pulse 2s infinite'
    }}>
      <span style={{ fontSize: '1.5rem' }}>☄️</span>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          METEOR SHOWER SALE!
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          {discount}% OFF everything!
        </div>
      </div>
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '5px 15px',
        borderRadius: '15px',
        fontFamily: 'monospace',
        fontWeight: 'bold'
      }}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
