export type Role = 'CITIZEN' | 'POLICE' | 'MANAGEMENT' | 'SIMULATOR' | 'TRAFFIC';

export interface Location {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  type: 'ACCIDENT' | 'CONSTRUCTION' | 'WEATHER' | 'OTHER';
  status: 'REPORTED' | 'DISPATCHED' | 'PROCESSING' | 'RESOLVED';
  location: Location;
  description: string;
  timestamp: number;
}

export interface TrafficSignal {
  id: string;
  location: Location;
  state: 'GREEN' | 'YELLOW' | 'RED' | 'FLASHING_YELLOW' | 'OFF';
  timer: number;
  mode: 'AUTO' | 'MANUAL';
}
