import { create } from 'zustand';
import type { TrafficSignal, Incident, Role, Location } from '../types';
import { fetchNearbyParking, fetchNearbyBikes, fetchStreetTraffic, fetchBusRoutes, fetchBusArrivalTimes, geocodeLocation } from '../services/tdxApi';

interface AppState {
  currentUser: { username: string, baseRole: 'CITIZEN' | 'POLICE' | 'MANAGEMENT' } | null;
  login: (username: string, pass: string) => Promise<boolean>;
  register: (username: string, pass: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  currentRole: Role;
  setRole: (role: Role) => void;
  
  incidents: Incident[];
  fetchIncidents: () => Promise<void>;
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateIncidentStatus: (id: string, status: Incident['status']) => Promise<void>;

  signals: TrafficSignal[];
  fetchSignals: () => Promise<void>;
  updateSignalMode: (id: string, mode: TrafficSignal['mode']) => Promise<void>;
  updateSignalTimer: (id: string, timer: number) => Promise<void>;
  updateSignalState: (id: string, state: TrafficSignal['state']) => Promise<void>;

  selectedSignalId: string | null;
  setSelectedSignalId: (id: string | null) => void;

  routeQuery: { origin: string, destination: string } | null;
  setRouteQuery: (query: { origin: string, destination: string } | null) => void;

  draftIncidentLocation: Location | null;
  setDraftIncidentLocation: (loc: Location | null) => void;

  trafficVolume: 'LOW' | 'MEDIUM' | 'HIGH';
  setTrafficVolume: (volume: 'LOW' | 'MEDIUM' | 'HIGH') => void;

  // Real TDX Data
  realBusData: any[];

  trafficQuery: string;
  setTrafficQuery: (street: string) => void;
  trafficQueryResult: { speed: number, volume: number, level: string } | null;
  isFetchingStreetTraffic: boolean;
  searchTraffic: (street: string) => Promise<void>;

  // Plan B - Traffic Panel States
  busRoutes: {id: string, name: string}[];
  selectedBusRoute: string | null;
  setSelectedBusRoute: (route: string | null) => void;
  
  parkingList: any[];
  selectedParkingId: string | null;
  setSelectedParkingId: (id: string | null) => void;

  bikeList: any[];
  selectedBikeId: string | null;
  setSelectedBikeId: (id: string | null) => void;

  tdxError: string | null;
  isFetchingTrafficPanel: boolean;
  
  fetchBusRoutesData: () => Promise<void>;
  fetchTrafficServices: (origin: string, destination: string) => Promise<void>;
  fetchBusRealTimeData: (route: string) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  login: async (username, password) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({ currentUser: { username: data.user.username, baseRole: data.user.role }, currentRole: data.user.role as Role });
      return true;
    } catch (e) {
      return false;
    }
  },
  register: async (username, password, role) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      set({ currentUser: { username: data.user.username, baseRole: data.user.role }, currentRole: data.user.role as Role });
      return { success: true };
    } catch (e) {
      return { success: false, error: '伺服器連線失敗' };
    }
  },
  logout: () => set({ currentUser: null, currentRole: 'CITIZEN' }),

  currentRole: 'CITIZEN',
  setRole: (role) => set({ currentRole: role }),

  incidents: [],
  fetchIncidents: async () => {
    try {
      const res = await fetch('http://localhost:3001/api/incidents');
      const data = await res.json();
      const incidents = data.map((inc: any) => ({
        ...inc,
        location: { lat: inc.locationLat, lng: inc.locationLng }
      }));
      set({ incidents });
    } catch(e) {}
  },
  addIncident: async (incident) => {
    try {
      await fetch('http://localhost:3001/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationLat: incident.location.lat,
          locationLng: incident.location.lng,
          type: incident.type,
          description: incident.description
        })
      });
      useStore.getState().fetchIncidents();
    } catch(e) {}
  },
  updateIncidentStatus: async (id, status) => {
    try {
      await fetch(`http://localhost:3001/api/incidents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      useStore.getState().fetchIncidents();
    } catch(e) {}
  },

  signals: [],
  fetchSignals: async () => {
    try {
      const res = await fetch('http://localhost:3001/api/signals');
      const data = await res.json();
      if (data && data.length > 0) {
        const signals = data.map((sig: any) => ({
          ...sig,
          location: { lat: sig.locationLat, lng: sig.locationLng }
        }));
        set({ signals });
      }
    } catch(e) {}
  },
  updateSignalMode: async (id, mode) => {
    await fetch(`http://localhost:3001/api/signals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) });
    useStore.getState().fetchSignals();
  },
  updateSignalTimer: async (id, timer) => {
    await fetch(`http://localhost:3001/api/signals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timer }) });
    useStore.getState().fetchSignals();
  },
  updateSignalState: async (id, state) => {
    await fetch(`http://localhost:3001/api/signals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) });
    useStore.getState().fetchSignals();
  },

  selectedSignalId: null,
  setSelectedSignalId: (id) => set({ selectedSignalId: id }),

  routeQuery: null,
  setRouteQuery: (query) => set({ routeQuery: query }),

  draftIncidentLocation: null,
  setDraftIncidentLocation: (loc) => set({ draftIncidentLocation: loc }),

  trafficVolume: 'MEDIUM',
  setTrafficVolume: (volume) => set({ trafficVolume: volume }),

  realBusData: [],

  trafficQuery: '',
  setTrafficQuery: (street) => set({ trafficQuery: street }),
  trafficQueryResult: null,
  isFetchingStreetTraffic: false,
  searchTraffic: async (street) => {
    set({ isFetchingStreetTraffic: true, trafficQuery: street });
    try {
      const result = await fetchStreetTraffic(street);
      set({ trafficQueryResult: result });
    } catch (e) {
      console.error('Error fetching street traffic', e);
    } finally {
      set({ isFetchingStreetTraffic: false });
    }
  },

  busRoutes: [],
  selectedBusRoute: null,
  setSelectedBusRoute: (route) => set({ selectedBusRoute: route }),
  
  parkingList: [],
  selectedParkingId: null,
  setSelectedParkingId: (id) => set({ selectedParkingId: id }),

  bikeList: [],
  selectedBikeId: null,
  setSelectedBikeId: (id) => set({ selectedBikeId: id }),

  tdxError: null,
  isFetchingTrafficPanel: false,

  fetchBusRoutesData: async () => {
    try {
      set({ isFetchingTrafficPanel: true, tdxError: null });
      const routes = await fetchBusRoutes();
      set({ busRoutes: routes });
    } catch (e: any) {
      set({ tdxError: e.message || 'TDX 限制: 無法獲取公車路線' });
    } finally {
      set({ isFetchingTrafficPanel: false });
    }
  },

  fetchTrafficServices: async (origin: string, destination: string) => {
    try {
      set({ isFetchingTrafficPanel: true, tdxError: null, parkingList: [], bikeList: [] });
      
      let lat = 25.033968;
      let lng = 121.564468;

      // Geocode either destination or origin (prefer destination to find parking)
      if (destination || origin) {
        const coords = await geocodeLocation(destination || origin);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      const [parking, bikes] = await Promise.all([
        fetchNearbyParking(lat, lng),
        fetchNearbyBikes(lat, lng)
      ]);

      set({ parkingList: parking, bikeList: bikes });
    } catch (e: any) {
      set({ tdxError: e.message || 'TDX 限制: 無法獲取即時資料' });
    } finally {
      set({ isFetchingTrafficPanel: false });
    }
  },

  fetchBusRealTimeData: async (route: string) => {
    try {
      set({ isFetchingTrafficPanel: true, tdxError: null });
      const buses = await fetchBusArrivalTimes(route);
      set({ realBusData: buses });
    } catch (e: any) {
      set({ tdxError: e.message || 'TDX 限制: 無法獲取公車動態' });
    } finally {
      set({ isFetchingTrafficPanel: false });
    }
  }
}));
