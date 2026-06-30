import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Video, CheckCircle, Clock, Truck } from 'lucide-react';
import type { Incident } from '../types';

export function PolicePanel() {
  const { incidents, updateIncidentStatus } = useStore();
  const [activeCctv, setActiveCctv] = useState<string | null>(null);

  const getStatusColor = (status: Incident['status']) => {
    switch(status) {
      case 'REPORTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'DISPATCHED': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'RESOLVED': return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  };

  const getStatusText = (status: Incident['status']) => {
    switch(status) {
      case 'REPORTED': return '待派遣';
      case 'DISPATCHED': return '派遣中';
      case 'PROCESSING': return '處理中';
      case 'RESOLVED': return '已結案';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
          事故通報與派遣
        </h2>
        
        {incidents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            目前無待處理案件
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-slate-200">{inc.type === 'ACCIDENT' ? '交通事故' : inc.type}</span>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(inc.status)}`}>
                    {getStatusText(inc.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{inc.description}</p>
                
                <div className="flex gap-2">
                  {inc.status === 'REPORTED' && (
                    <button onClick={() => updateIncidentStatus(inc.id, 'DISPATCHED')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                      <Truck className="w-3 h-3" /> 派遣
                    </button>
                  )}
                  {inc.status === 'DISPATCHED' && (
                    <button onClick={() => updateIncidentStatus(inc.id, 'PROCESSING')} className="flex-1 bg-orange-600 hover:bg-orange-500 text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> 到場
                    </button>
                  )}
                  {inc.status === 'PROCESSING' && (
                    <button onClick={() => updateIncidentStatus(inc.id, 'RESOLVED')} className="flex-1 bg-green-600 hover:bg-green-500 text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3" /> 結案
                    </button>
                  )}
                  <button onClick={() => setActiveCctv(inc.id)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                    <Video className="w-3 h-3" /> CCTV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simulated CCTV Modal */}
      {activeCctv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-3 border-b border-slate-700 bg-slate-900/50">
              <h3 className="font-bold flex items-center gap-2"><Video className="w-4 h-4 text-red-500 animate-pulse" /> 現場監控畫面 (模擬)</h3>
              <button onClick={() => setActiveCctv(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center">
              <div className="absolute top-4 right-4 text-white font-mono text-sm bg-black/50 px-2 py-1 rounded">REC 00:00:00</div>
              <div className="text-slate-600 text-sm">CCTV Feed Unavailable</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
