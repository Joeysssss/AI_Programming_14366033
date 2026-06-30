import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { CitizenPanel } from './components/CitizenPanel';
import { PolicePanel } from './components/PolicePanel';
import { ManagementPanel } from './components/ManagementPanel';
import { SimulatorPanel } from './components/SimulatorPanel';
import { TrafficPanel } from './components/TrafficPanel';
import { Directions } from './components/Directions';
import { LoginScreen } from './components/LoginScreen';
import { AlertTriangle, LogOut } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const XINYI_KEELUNG_COORD = { lat: 25.0332, lng: 121.5583 };

function App() {
  const { 
    currentRole, setRole, incidents, setDraftIncidentLocation, draftIncidentLocation, 
    signals, selectedSignalId,
    parkingList, selectedParkingId,
    bikeList, selectedBikeId,
    realBusData, selectedBusRoute,
    currentUser, logout
  } = useStore();

  useEffect(() => {
    if (!currentUser) return;
    
    // Initial fetch
    useStore.getState().fetchSignals();
    useStore.getState().fetchIncidents();

    // Poll signals every second to sync with backend
    const interval = setInterval(() => {
      useStore.getState().fetchSignals();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle live bus tracking interval
  useEffect(() => {
    let interval: any;
    if (currentRole === 'TRAFFIC' && selectedBusRoute) {
      // Fetch every 15s to track buses
      interval = setInterval(() => {
        useStore.getState().fetchBusRealTimeData(selectedBusRoute);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [currentRole, selectedBusRoute]);

  const handleCameraChange = (_ev: MapCameraChangedEvent) => {};

  const handleMapClick = (ev: any) => {
    const latLng = ev.detail?.latLng || ev.latLng;
    if (latLng && currentRole === 'CITIZEN') {
      const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
      const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
      setDraftIncidentLocation({ lat, lng });
    }
  };

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white flex-col">
        <h1 className="text-2xl mb-4 font-bold">台北市智慧交通資訊系統</h1>
        <p className="text-slate-400">請在根目錄的 `.env` 檔案中設定您的 Google Maps API Key</p>
        <code className="bg-slate-800 p-2 mt-4 rounded">VITE_GOOGLE_MAPS_API_KEY=您的金鑰</code>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const allowedRoles = {
    CITIZEN: ['CITIZEN', 'TRAFFIC'],
    POLICE: ['CITIZEN', 'POLICE', 'TRAFFIC', 'SIMULATOR'],
    MANAGEMENT: ['CITIZEN', 'MANAGEMENT', 'TRAFFIC', 'SIMULATOR']
  }[currentUser.baseRole] || [];

  const identityRoles = [
    { id: 'CITIZEN', label: '民眾視角' },
    { id: 'POLICE', label: '警察視角' },
    { id: 'MANAGEMENT', label: '管理單位' }
  ].filter(r => allowedRoles.includes(r.id));

  const featureRoles = [
    { id: 'TRAFFIC', label: '即時交通' },
    { id: 'SIMULATOR', label: '模擬控制' }
  ].filter(r => allowedRoles.includes(r.id));

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-100">
        
        {/* Sidebar / Left Panel */}
        <aside className="w-[450px] bg-slate-800/90 backdrop-blur-md border-r border-slate-700 flex flex-col z-10 shadow-2xl">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              智慧交通管理系統
            </h1>
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-white transition-colors"
              title="登出"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">身分區塊</label>
              <div className="grid grid-cols-2 gap-2">
                {identityRoles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setRole(role.id as any)}
                    className={`py-2 rounded text-sm font-medium transition-all duration-200 ${
                      currentRole === role.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' 
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {featureRoles.length > 0 && (
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">系統功能</label>
                <div className="grid grid-cols-2 gap-2">
                  {featureRoles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setRole(role.id as any)}
                      className={`py-2 rounded text-sm font-medium transition-all duration-200 ${
                        currentRole === role.id 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]' 
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-white'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {currentRole === 'CITIZEN' && <CitizenPanel />}
            {currentRole === 'POLICE' && <PolicePanel />}
            {currentRole === 'MANAGEMENT' && <ManagementPanel />}
            {currentRole === 'SIMULATOR' && <SimulatorPanel />}
            {currentRole === 'TRAFFIC' && <TrafficPanel />}
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative">
          {currentRole === 'CITIZEN' && (
            <div className="absolute top-4 right-4 z-10 bg-slate-800/90 text-slate-300 text-xs px-3 py-2 rounded-lg shadow border border-slate-600">
              💡 提示：點擊地圖任意位置可設定事故回報地點
            </div>
          )}
          <Map
            defaultZoom={16}
            defaultCenter={XINYI_KEELUNG_COORD}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            onCameraChanged={handleCameraChange}
            onClick={handleMapClick}
            className="w-full h-full cursor-crosshair"
          >
            <Directions />

            {/* Draft Incident Location Marker */}
            {draftIncidentLocation && currentRole === 'CITIZEN' && (
               <AdvancedMarker position={draftIncidentLocation}>
                 <div className="bg-orange-500/80 p-1.5 rounded-full border-2 border-white animate-pulse">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                 </div>
               </AdvancedMarker>
            )}

            {/* Render Incidents */}
            {incidents.map(inc => (
              <AdvancedMarker key={inc.id} position={inc.location}>
                <div className="bg-red-600 p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
              </AdvancedMarker>
            ))}


            {/* Selected Parking Marker */}
            {currentRole === 'TRAFFIC' && selectedParkingId && parkingList.filter(p => p.id === selectedParkingId).map(p => (
              <AdvancedMarker key={p.id} position={{ lat: p.lat, lng: p.lng }} zIndex={50}>
                <div className={`p-1.5 rounded-lg border-2 shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-emerald-600 border-white`}>
                  <div className="text-white text-xs font-bold whitespace-nowrap text-center">
                    <div>🅿️ {p.name}</div>
                    <div className="text-[10px]">{p.available > 0 ? `剩 ${p.available} 車位` : '已滿'}</div>
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Selected Shared Bike Marker */}
            {currentRole === 'TRAFFIC' && selectedBikeId && bikeList.filter(b => b.id === selectedBikeId).map(b => (
              <AdvancedMarker key={b.id} position={{ lat: b.lat, lng: b.lng }} zIndex={50}>
                <div className={`p-1.5 rounded-lg border-2 shadow-[0_0_15px_rgba(234,179,8,0.5)] bg-yellow-500 border-white`}>
                  <div className="text-slate-900 text-xs font-bold whitespace-nowrap text-center">
                    <div>🚲 {b.name}</div>
                    <div className="text-[10px]">剩 {b.availableBikes} 台</div>
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Real-Time Bus Stops (ETA) Markers */}
            {currentRole === 'TRAFFIC' && selectedBusRoute && realBusData && realBusData.map((stop: any) => (
              <AdvancedMarker key={stop.id} position={{ lat: stop.lat, lng: stop.lng }} zIndex={40}>
                <div className={`p-1.5 rounded border-2 shadow-[0_0_10px_rgba(59,130,246,0.5)] ${stop.estimateTime !== null && stop.estimateTime <= 3 ? 'bg-red-600 border-white' : stop.estimateTime !== null ? 'bg-green-600 border-white' : 'bg-slate-700 border-slate-500'}`}>
                  <div className="text-white text-[10px] font-bold whitespace-nowrap text-center">
                    <div>🚏 {stop.stopName}</div>
                    <div className={stop.estimateTime !== null ? 'text-white' : 'text-slate-300'}>
                      {stop.statusText}
                    </div>
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Render All Signal Markers for Simulator */}
            {currentRole === 'SIMULATOR' && signals.map(sig => {
              const isSelected = sig.id === selectedSignalId;
              const shortName = sig.id.replace('信義基隆路口 - ', '');
              return (
                <AdvancedMarker key={`signal-${sig.id}`} position={sig.location} zIndex={isSelected ? 9999 : 9000}>
                  <div className={`bg-slate-900/90 p-1.5 rounded-lg border-2 ${isSelected ? 'border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] scale-110' : 'border-slate-600 shadow'} flex flex-col items-center min-w-[45px] transform translate-y-[-50%] transition-all`}>
                    <div className="text-white text-[10px] font-bold whitespace-nowrap mb-1">{shortName}</div>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full border border-white/80 shadow-inner ${sig.state === 'RED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]' : sig.state === 'GREEN' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]'}`}></div>
                      <div className="text-white text-[10px] font-mono font-bold">{sig.timer}</div>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Debug Overlay */}
            {currentRole === 'SIMULATOR' && (
              <div className="absolute top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded text-xs border border-slate-700">
                Debug Selected Signal: {selectedSignalId || 'None'}
              </div>
            )}
          </Map>
        </main>
      </div>
    </APIProvider>
  );
}

export default App;
