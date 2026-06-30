import { useState } from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, MapPin, Navigation, Activity } from 'lucide-react';

export function CitizenPanel() {
  const { addIncident, setRouteQuery, draftIncidentLocation, setDraftIncidentLocation, trafficQuery, setTrafficQuery, trafficQueryResult, isFetchingStreetTraffic, searchTraffic } = useStore();
  const [reportType, setReportType] = useState<'ACCIDENT' | 'CONSTRUCTION' | 'WEATHER' | 'OTHER'>('ACCIDENT');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [avoidOptions, setAvoidOptions] = useState({ congestion: true, construction: true, weather: false });

  const handleRoute = () => {
    if (!origin || !destination) {
      alert('請輸入起點與終點');
      return;
    }
    const confirmMsg = avoidOptions.congestion || avoidOptions.construction || avoidOptions.weather 
      ? `即將根據您選擇的多目標避險條件 (${[avoidOptions.congestion && '壅塞', avoidOptions.construction && '施工', avoidOptions.weather && '天候'].filter(Boolean).join('、')})，透過 AI 重新計算最安全路線權重，請確認是否開始導航？` 
      : '即將為您規劃一般路線，請確認是否開始導航？';
    if (window.confirm(confirmMsg)) {
      setRouteQuery({ origin, destination });
    }
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    if (!draftIncidentLocation) {
      alert('請先點擊地圖選擇事發地點！');
      return;
    }
    
    addIncident({
      type: reportType,
      description,
      location: draftIncidentLocation
    });
    
    setDescription('');
    setDraftIncidentLocation(null);
    alert('回報成功！已通知相關單位。');
  };

  const handleTrafficSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trafficQuery.trim()) return;
    searchTraffic(trafficQuery.trim());
  };

  const simulateDrive = () => {
    alert("語音提示：『前方三百公尺，科技執法路段，限速 50 公里，請減速慢行。』");
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold mb-4 flex items-center text-blue-300">
          <Activity className="mr-2" size={20} />
          即時路況查詢
        </h2>
        <form onSubmit={handleTrafficSearch} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="輸入街道名稱 (例如: 信義路)"
              value={trafficQuery}
              onChange={(e) => setTrafficQuery(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isFetchingStreetTraffic}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isFetchingStreetTraffic ? '查詢中...' : '查詢'}
            </button>
          </div>
        </form>

        {trafficQueryResult && (
          <div className="mt-4 bg-slate-800/80 border border-slate-600 rounded p-3 animate-fade-in">
            <div className="text-sm text-slate-300 mb-2">
              <span className="font-bold text-white mr-1">{trafficQuery}</span> 的即時路況：
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700/50 p-2 rounded text-center border border-slate-600">
                <div className="text-xs text-slate-400">平均車速</div>
                <div className={`text-lg font-bold ${trafficQueryResult.speed < 20 ? 'text-red-400' : trafficQueryResult.speed < 35 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {trafficQueryResult.speed} <span className="text-[10px] text-slate-500 font-normal">km/h</span>
                </div>
              </div>
              <div className="bg-slate-700/50 p-2 rounded text-center border border-slate-600">
                <div className="text-xs text-slate-400">推估車流量</div>
                <div className="text-lg font-bold text-cyan-300">
                  {trafficQueryResult.volume} <span className="text-[10px] text-slate-500 font-normal">輛/小時</span>
                </div>
              </div>
            </div>
            <div className={`mt-2 p-1.5 rounded text-center text-xs font-bold border ${trafficQueryResult.level === '嚴重壅塞' ? 'bg-red-500/20 text-red-400 border-red-500/50' : trafficQueryResult.level === '車多' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
              狀態：{trafficQueryResult.level}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-400" />
          規劃智慧多目標導航路線
        </h2>
        <div className="space-y-3">
          <input value={origin} onChange={e => setOrigin(e.target.value)} type="text" placeholder="起點 (如: 台北車站)" className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          <input value={destination} onChange={e => setDestination(e.target.value)} type="text" placeholder="終點 (如: 台北101)" className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          
          <div className="flex gap-2 text-xs text-slate-300">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={avoidOptions.congestion} onChange={e => setAvoidOptions({...avoidOptions, congestion: e.target.checked})} className="rounded text-blue-500" /> 避開壅塞
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={avoidOptions.construction} onChange={e => setAvoidOptions({...avoidOptions, construction: e.target.checked})} className="rounded text-blue-500" /> 避開施工
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={avoidOptions.weather} onChange={e => setAvoidOptions({...avoidOptions, weather: e.target.checked})} className="rounded text-blue-500" /> 避開天候
            </label>
          </div>

          <button onClick={handleRoute} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-colors">
            開始導航
          </button>

          <button onClick={simulateDrive} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition-colors mt-2 text-sm">
            ▶ 模擬行駛 (動態偵測執法路段)
          </button>
        </div>
      </div>

      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          異常路況回報
        </h2>
        <form onSubmit={handleReport} className="space-y-3">
          {draftIncidentLocation ? (
            <div className="text-xs bg-green-500/20 text-green-300 p-2 rounded border border-green-500/30 flex justify-between items-center">
              已選擇地圖座標: {draftIncidentLocation.lat.toFixed(4)}, {draftIncidentLocation.lng.toFixed(4)}
              <button type="button" onClick={() => setDraftIncidentLocation(null)} className="text-slate-400 hover:text-white">取消</button>
            </div>
          ) : (
            <div className="text-xs bg-orange-500/10 text-orange-300 p-2 rounded border border-orange-500/30">
              * 請先在地圖上點擊事發地點
            </div>
          )}
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="ACCIDENT">交通事故</option>
            <option value="CONSTRUCTION">道路施工</option>
            <option value="WEATHER">天候異常 (積水/濃霧)</option>
            <option value="OTHER">其他</option>
          </select>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="請簡述現場狀況..." 
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:border-orange-500" 
          />
          <button disabled={!draftIncidentLocation} type="submit" className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-500 text-white font-medium py-2 rounded transition-colors flex justify-center items-center gap-2">
            <MapPin className="w-4 h-4" />
            送出回報
          </button>
        </form>
      </div>

    </div>
  );
}
