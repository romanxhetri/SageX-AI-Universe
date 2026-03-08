'use client';

export {
  EnhancedSolarSystemScene,
  default as EnhancedScene
} from './EnhancedScene';

export {
  // Types
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
  
  // Components
  SpaceshipSelector,
  WormholeOverlay,
  WeatherOverlay,
  SpaceStationOverlay,
  MeteorEventBanner
} from './VisualEnhancements';
