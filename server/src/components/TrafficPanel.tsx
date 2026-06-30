import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Bus, Car, Bike, MapPin, Search, AlertCircle } from 'lucide-react';

export function TrafficPanel() {
  const { 
    busRoutes, selectedBusRoute, setSelectedBusRoute, fetchBusRoutesData, fetchBusRealTimeData,
    parkingList, selectedParkingId, setSelectedParkingId,
    bikeList, selectedBikeId, setSelectedBikeId,
    fetchTrafficServices, isFetchingTrafficPanel, tdxError, routeQuery,
    realBusData
  } = useStore();

  const [busSearch, setBusSearch] = useState('');
  const [locQuery, setLocQuery] = useState('');

  // Fetch bus routes once
  useEffect(() => {
    if (busRoutes.length === 0) {
      fetchBusRoutesData();
    }
  }, [busRoutes.length, fetchBusRoutesData]);

  // Sync locQuery with routeQuery
  useEffect(() => {
    if (routeQuery && !locQuery) {
      const q = routeQuery.destination || routeQuery.origin;
      setLocQuery(q);
      fetchTrafficServices('', q);
    }
  }, [routeQuery, fetchTrafficServices, locQuery]);

  const handleBusSelect = (route: string) => {
    setSelectedBusRoute(selectedBusRoute === route ? null : route);
    if (selectedBusRoute !== route) {
      fetchBusRealTimeData(route);
    }
  };

  const handleLocSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrafficServices('', locQuery.trim());
  };

  const filteredBuses = busRoutes.filter(r => r.name.includes(busSearch)).slice(0, 50);

  return (
    <div className="space-y-6">
      {tdxError && (
        <div className="bg-red-500/20 border border-red-500 p-3 rounded-lg flex items-start gap-2 text-red-300 text-sm animate-pulse">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{tdxError}</p>
        </div>
      )}

      {/* Bus Section */}
      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
          <Bus className="w-5 h-5" />
          大眾運輸即時動態
        </h2>
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜尋公車路線 (例如: 284, 信義幹線)"
              value={busSearch}
              onChange={e => setBusSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="h-64 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-600">
          {isFetchingTrafficPanel && busRoutes.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-4">載入路線中...</div>
          ) : filteredBuses.length > 0 ? (
            filteredBuses.map(route => (
              <div key={route.id}>
                <button
                  onClick={() => handleBusSelect(route.name)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${selectedBusRoute === route.name ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {route.name}
                </button>
                
                {/* Render Stops and ETA if selected */}
                {selectedBusRoute === route.name && (
                  <div className="mt-2 mb-4 bg-slate-800/50 p-2 rounded border border-slate-700 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                    <div className="text-xs font-bold text-slate-400 mb-2 px-1">站牌預估到站時間 (去程與回程)</div>
                    {isFetchingTrafficPanel && realBusData.length === 0 ? (
                      <div className="text-xs text-center text-slate-500 py-2">載入動態中...</div>
                    ) : realBusData.length > 0 ? (
                      <div className="space-y-1.5">
                        {realBusData.map(stop => (
                          <div key={stop.id} className="flex justify-between items-center text-xs px-2 py-1.5 bg-slate-800 rounded border border-slate-700">
                            <div className="flex flex-col">
                              <span className="text-slate-300">{stop.stopName}</span>
                              <span className="text-[10px] text-slate-500">{stop.direction === 0 ? '去程' : stop.direction === 1 ? '返程' : '未知方向'}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              stop.estimateTime !== null && stop.estimateTime <= 3 ? 'bg-red-500/20 text-red-400' :
                              stop.estimateTime !== null ? 'bg-green-500/20 text-green-400' : 
                              'bg-slate-700 text-slate-400'
                            }`}>
                              {stop.statusText}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-center text-slate-500 py-2">目前無資料或營運已結束</div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-400 text-center py-4">找不到相關路線</div>
          )}
        </div>
      </div>

      {/* Parking & Shared Bikes Section */}
      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          周圍停車場與共享運具
        </h2>
        
        <form onSubmit={handleLocSearch} className="mb-4">
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="輸入起終點或地標 (例如: 台北101)"
              value={locQuery}
              onChange={e => setLocQuery(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button 
              type="submit"
              disabled={isFetchingTrafficPanel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            >
              {isFetchingTrafficPanel && locQuery ? '查詢中...' : '搜尋周邊'}
            </button>
          </div>
        </form>

        {isFetchingTrafficPanel && locQuery && parkingList.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-4">查詢周邊資料中...</div>
        ) : (
          <div className="space-y-4">
            {/* Parking List */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-1">
                <Car className="w-4 h-4" /> 停車場狀態
              </h3>
              {parkingList.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600">
                  {parkingList.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedParkingId(p.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors border ${selectedParkingId === p.id ? 'bg-emerald-600/80 border-emerald-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{p.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.available > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          剩 {p.available >= 0 ? p.available : '未知'} / 總 {p.total}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                        <span className="truncate pr-2">{p.address}</span>
                        <span className="whitespace-nowrap bg-slate-900/50 px-1.5 py-0.5 rounded">距 {p.distance}m</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-slate-800/50 p-2 rounded">尚無資料，請輸入地點查詢。</div>
              )}
            </div>

            {/* Bikes List */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-1">
                <Bike className="w-4 h-4" /> 共享單車狀態
              </h3>
              {bikeList.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600">
                  {bikeList.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBikeId(b.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors border ${selectedBikeId === b.id ? 'bg-yellow-600/80 border-yellow-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{b.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${b.availableBikes > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          借 {b.availableBikes} / 還 {b.availableReturnBikes}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                        <span className="truncate pr-2">{b.address}</span>
                        <span className="whitespace-nowrap bg-slate-900/50 px-1.5 py-0.5 rounded">距 {b.distance}m</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-slate-800/50 p-2 rounded">尚無資料，請輸入地點查詢。</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
