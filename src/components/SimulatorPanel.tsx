
import { useStore } from '../store/useStore';
import { Activity, RadioReceiver } from 'lucide-react';

export function SimulatorPanel() {
  const { signals, trafficVolume, setTrafficVolume, selectedSignalId, setSelectedSignalId } = useStore();

  const getTimings = (vol = trafficVolume) => {
    switch(vol) {
      case 'LOW': return { green: 30, red: 20 };
      case 'HIGH': return { green: 60, red: 45 };
      default: return { green: 45, red: 30 }; // MEDIUM
    }
  };

  const resetPhase = async (vol: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setTrafficVolume(vol);
    const timings = getTimings(vol);
    if (!signals.length) return;
    
    const updates = [
      { id: signals[0].id, state: 'GREEN', timer: timings.green },
      { id: signals[1].id, state: 'GREEN', timer: timings.green },
      { id: signals[2].id, state: 'RED', timer: timings.green + 3 },
      { id: signals[3].id, state: 'RED', timer: timings.green + 3 },
    ];
    
    await Promise.all(updates.map(u => 
      fetch(`http://localhost:3001/api/signals/${u.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ state: u.state, timer: u.timer }) 
      })
    ));
    useStore.getState().fetchSignals();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          (模擬) 即時交通環境
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">路口車流量 (動態)</div>
            <div className="text-xl font-bold text-cyan-300">
              {trafficVolume === 'LOW' ? '45' : trafficVolume === 'HIGH' ? '210' : '124'} 
              <span className="text-xs font-normal text-slate-500">輛/分</span>
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">平均車速</div>
            <div className={`text-xl font-bold ${trafficVolume === 'HIGH' ? 'text-red-300' : 'text-green-300'}`}>
              {trafficVolume === 'LOW' ? '45' : trafficVolume === 'HIGH' ? '15' : '32'} 
              <span className="text-xs font-normal text-slate-500">km/h</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded border border-slate-700">
          <div className="text-xs text-slate-400 mb-2">模擬情境控制 (影響號誌秒數)</div>
          <div className="flex gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(vol => (
              <button 
                key={vol}
                onClick={() => resetPhase(vol)}
                className={`flex-1 py-1 text-xs rounded transition-colors ${trafficVolume === vol ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                {vol === 'LOW' ? '離峰 (少)' : vol === 'MEDIUM' ? '平峰 (中)' : '尖峰 (多)'}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 text-center">
            * 點擊按鈕將會強制重置目前燈號週期
          </div>
        </div>
      </div>

      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <RadioReceiver className="w-5 h-5 text-purple-400" />
          信義/基隆路口 紅綠燈狀態
        </h2>
        
        <div className="space-y-2">
          {signals.map(sig => (
            <div 
              key={sig.id} 
              onClick={() => setSelectedSignalId(sig.id === selectedSignalId ? null : sig.id)}
              className={`p-3 rounded border flex justify-between items-center cursor-pointer transition-colors ${selectedSignalId === sig.id ? 'bg-indigo-900/50 border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.3)]' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
            >
              <span className={`text-sm font-medium ${selectedSignalId === sig.id ? 'text-indigo-300' : 'text-slate-300'}`}>{sig.id}</span>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${sig.state === 'RED' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : sig.state === 'GREEN' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>
                  {sig.state === 'RED' ? '紅燈' : sig.state === 'GREEN' ? '綠燈' : '黃燈'}
                </span>
                <span className="text-lg font-mono font-bold w-6 text-right">{sig.timer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
