// src/services/tdxApi.ts

const CLIENT_ID = import.meta.env.VITE_TDX_CLIENT_ID || '';
const CLIENT_SECRET = import.meta.env.VITE_TDX_CLIENT_SECRET || '';

let accessToken = '';
let tokenExpiry = 0;

export async function getTdxToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn('TDX credentials not found in environment variables. Please add VITE_TDX_CLIENT_ID and VITE_TDX_CLIENT_SECRET');
    return '';
  }

  // If token is still valid (with 1 min buffer), return it
  if (accessToken && Date.now() < tokenExpiry - 60000) {
    return accessToken;
  }

  const url = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // data.expires_in is in seconds
    tokenExpiry = Date.now() + data.expires_in * 1000;
    return accessToken;
  } catch (error) {
    console.error('Failed to get TDX token:', error);
    return '';
  }
}

async function fetchTdx(endpoint: string) {
  const token = await getTdxToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://tdx.transportdata.tw/api/${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('TDX fetch error for', endpoint, error);
    return null;
  }
}

// Taipei 101 (Default fallback based on user script)
const CENTER_LAT = 25.033968;
const CENTER_LNG = 121.564468;
const RADIUS = 800; // meters

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(r * c);
}

export async function fetchNearbyParking(lat = CENTER_LAT, lng = CENTER_LNG) {
  try {
    const parkings = await fetchTdx(`basic/v1/Parking/OffStreet/CarPark/City/Taipei?$format=JSON`);
    const availabilities = await fetchTdx(`basic/v1/Parking/OffStreet/ParkingAvailability/City/Taipei?$format=JSON`);
    
    if (!parkings) {
      throw new Error('No parking data found');
    }

    const availMap = new Map();
    const pAvailList = availabilities?.ParkingAvailabilities || availabilities || [];
    if (Array.isArray(pAvailList)) {
      pAvailList.forEach((a: any) => availMap.set(a.CarParkID, a));
    }

    const pData = parkings.CarParks || parkings;
    const result: any[] = [];

    if (Array.isArray(pData)) {
      pData.forEach((p: any) => {
        const pLat = p.CarParkPosition?.PositionLat;
        const pLng = p.CarParkPosition?.PositionLon;
        if (!pLat || !pLng) return;

        const dist = haversine(lat, lng, pLat, pLng);
        if (dist <= RADIUS) {
          const avail = availMap.get(p.CarParkID);
          const availableSpaces = avail && avail.AvailableSpaces !== undefined ? avail.AvailableSpaces : -1;
          result.push({
            id: p.CarParkID,
            name: p.CarParkName?.Zh_tw || '停車場',
            address: p.Address || '無資料',
            lat: pLat,
            lng: pLng,
            distance: dist,
            available: availableSpaces,
            total: p.ParkingSpaces || p.TotalSpaces || 0
          });
        }
      });
    }

    if (result.length === 0) {
      throw new Error('No parking data found');
    }

    return result.sort((a, b) => a.distance - b.distance);
  } catch (e) {
    console.error('TDX Parking API error', e);
    throw e;
  }
}

export async function fetchNearbyBikes(lat = CENTER_LAT, lng = CENTER_LNG) {
  try {
    const stations = await fetchTdx(`basic/v2/Bike/Station/City/Taipei?$format=JSON`);
    const availabilities = await fetchTdx(`basic/v2/Bike/Availability/City/Taipei?$format=JSON`);

    if (!stations || !Array.isArray(stations) || stations.length === 0) {
      throw new Error('No bike data found');
    }

    const availMap = new Map();
    if (Array.isArray(availabilities)) {
      availabilities.forEach((a: any) => availMap.set(a.StationUID, a));
    }

    const result: any[] = [];
    stations.forEach((s: any) => {
      const sLat = s.StationPosition?.PositionLat;
      const sLng = s.StationPosition?.PositionLon;
      if (!sLat || !sLng) return;

      const dist = haversine(lat, lng, sLat, sLng);
      if (dist <= RADIUS) {
        const avail = availMap.get(s.StationUID);
        result.push({
          id: s.StationUID,
          name: s.StationName?.Zh_tw?.replace('YouBike2.0_', '') || 'YouBike站點',
          address: s.StationAddress?.Zh_tw || '無資料',
          lat: sLat,
          lng: sLng,
          distance: dist,
          availableBikes: avail ? avail.AvailableRentBikes : 0,
          availableReturnBikes: avail ? avail.AvailableReturnBikes : 0,
          totalBikes: avail ? avail.AvailableReturnBikes + avail.AvailableRentBikes : 0
        });
      }
    });

    return result.sort((a, b) => a.distance - b.distance);
  } catch (e) {
    console.error('TDX Bike API error', e);
    throw e;
  }
}

export async function fetchBusRoutes() {
  try {
    const routes = await fetchTdx(`basic/v2/Bus/Route/City/Taipei?$select=RouteUID,RouteName&$format=JSON`);
    if (!routes || !Array.isArray(routes)) {
      throw new Error('No bus routes found');
    }
    // Deduplicate by RouteName.Zh_tw
    const routeMap = new Map();
    routes.forEach(r => {
      if (r.RouteName?.Zh_tw) {
        routeMap.set(r.RouteName.Zh_tw, r.RouteUID);
      }
    });
    return Array.from(routeMap.entries()).map(([name, uid]) => ({ id: uid as string, name: name as string })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error('TDX Bus Routes API error', e);
    throw e;
  }
}

export async function fetchBusArrivalTimes(routeName: string) {
  try {
    const safeRouteName = encodeURIComponent(routeName);
    // 1. Fetch stops sequence and coordinates
    const stopsRes = await fetchTdx(`basic/v2/Bus/StopOfRoute/City/Taipei/${safeRouteName}?$format=JSON`);
    if (!stopsRes || !Array.isArray(stopsRes)) return [];

    // 2. Fetch ETA
    const etaRes = await fetchTdx(`basic/v2/Bus/EstimatedTimeOfArrival/City/Taipei/${safeRouteName}?$format=JSON`);
    if (!etaRes || !Array.isArray(etaRes)) return [];

    const etaMap = new Map();
    etaRes.forEach((e: any) => {
      // Key: Direction_StopUID
      etaMap.set(`${e.Direction}_${e.StopUID}`, e);
    });

    const result: any[] = [];
    stopsRes.forEach((routeDir: any) => {
      const direction = routeDir.Direction; // 0: Go, 1: Back
      if (routeDir.Stops) {
        routeDir.Stops.forEach((stop: any) => {
          const etaData = etaMap.get(`${direction}_${stop.StopUID}`);
          
          let statusText = '無即時資料';
          let estimateTime = null;
          
          if (etaData) {
            if (etaData.EstimateTime !== undefined) {
              estimateTime = Math.floor(etaData.EstimateTime / 60);
              statusText = estimateTime === 0 ? '即將進站' : `${estimateTime} 分鐘`;
            } else {
              const statusMap: Record<number, string> = {
                0: '正常',
                1: '尚未發車',
                2: '交管不停靠',
                3: '末班車已過',
                4: '今日未營運'
              };
              statusText = statusMap[etaData.StopStatus] || '無即時資料';
            }
          }

          result.push({
            id: `${direction}_${stop.StopUID}`,
            direction,
            stopSequence: stop.StopSequence,
            stopName: stop.StopName?.Zh_tw || '未知站牌',
            lat: stop.StopPosition?.PositionLat,
            lng: stop.StopPosition?.PositionLon,
            statusText,
            estimateTime
          });
        });
      }
    });

    return result;
  } catch (e) {
    console.error('TDX Bus Arrival Times API error', e);
    throw e;
  }
}

export async function fetchStreetTraffic(streetName: string) {
  if (!streetName.trim()) return null;

  try {
    // 1. Try to fetch VD list filtered by RoadName
    // Note: TDX basic/v2/Road/Traffic/VD/City/Taipei can be huge, using $filter
    const vds = await fetchTdx(`basic/v2/Road/Traffic/VD/City/Taipei?$filter=contains(RoadName,'${encodeURIComponent(streetName)}')&$format=JSON`);
    
    if (!vds || !vds.VDs || vds.VDs.length === 0) {
      throw new Error('No VD found for this street');
    }

    // 2. Fetch Live data for those VDs
    const liveData = await fetchTdx(`basic/v2/Road/Traffic/Live/VD/City/Taipei?$format=JSON`);
    if (!liveData || !liveData.VDLives) {
      throw new Error('Live VD API failed');
    }

    // 3. Match and calculate average speed & volume
    const targetVdIds = new Set(vds.VDs.map((vd: any) => vd.VDID));
    let totalSpeed = 0;
    let totalVolume = 0;
    let count = 0;

    for (const live of liveData.VDLives) {
      if (targetVdIds.has(live.VDID) && live.LinkFlows && live.LinkFlows[0] && live.LinkFlows[0].Lanes && live.LinkFlows[0].Lanes[0]) {
        const lane = live.LinkFlows[0].Lanes[0];
        totalSpeed += lane.Speed || 0;
        totalVolume += lane.Vehicles.reduce((sum: number, v: any) => sum + (v.Volume || 0), 0);
        count++;
      }
    }

    if (count === 0) {
      throw new Error('No live VD data found for this street');
    }

    const speed = Math.round(totalSpeed / count);
    const volume = Math.round(totalVolume * 60); // estimate hourly volume from typical 1-min data
    const level = speed < 20 ? '嚴重壅塞' : speed < 35 ? '車多' : '順暢';

    return { speed, volume, level };
  } catch (e) {
    console.error('TDX Traffic API error', e);
    throw e;
  }
}

export async function geocodeLocation(query: string): Promise<{lat: number, lng: number} | null> {
  if (!query) return null;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=台北市${encodeURIComponent(query)}&limit=1`);
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (e) {
    console.error('Geocoding error:', e);
    return null;
  }
}
