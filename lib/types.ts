export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface DebrisObject {
  id: string;
  name: string;
  tle1: string;
  tle2: string;
  type: 'Rocket Body' | 'Dead Satellite' | 'Fragment';
  mass_kg?: number;
  size_m?: number;
  launchYear?: number;
}

export interface ClosestApproachResult {
  debrisId: string;
  debrisName: string;
  minDistance_km: number;
  timeOfClosestApproach: Date;
  tMinusSeconds: number;
  riskLevel: RiskLevel;
  altitude_km: number;
  inclination_deg: number;
  raan_deg: number;
  period_min: number;
  eccentricity: number;
  objectType: 'Rocket Body' | 'Dead Satellite' | 'Fragment';
  noradId?: string;
  relativeVelocity_kms: number;
  distanceOverTime: { time: number; distance: number }[];
}

export interface OrbitalPoint {
  x: number;
  y: number;
  z: number;
}

export interface UserAddedObject {
  name: string;
  altitude_km: number;
  inclination_deg: number;
  raan_deg: number;
}

export interface SimulationState {
  timeWindowHours: number;
  riskFilter: 'ALL' | 'HIGH+' | 'CRITICAL';
  results: ClosestApproachResult[];
  isComputing: boolean;
  selectedDebrisId: string | null;
}
