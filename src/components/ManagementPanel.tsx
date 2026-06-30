import { FileText, BarChart2, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

export function ManagementPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          交通數據分析 (即時戰情)
        </h2>
        
        <div className="space-y-3">
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-300">易壅塞路段 Top 3</span>
              <TrendingUp className="w-4 h-4 text-red-400" />
            </div>
            <ul className="text-xs space-y-2">
              <li className="flex justify-between items-center border-b border-slate-700 pb-1">
                <span className="text-red-300">1. 基隆路一段 (往南)</span>
                <span className="bg-red-500/20 text-red-400 px-1.5 rounded">時速 15km</span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-700 pb-1">
                <span className="text-orange-300">2. 信義路四段 (往東)</span>
                <span className="bg-orange-500/20 text-orange-400 px-1.5 rounded">時速 22km</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-yellow-300">3. 光復南路 (往北)</span>
                <span className="bg-yellow-500/20 text-yellow-400 px-1.5 rounded">時速 30km</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-800 p-3 rounded border border-slate-700 flex gap-4">
            <div className="flex-1 text-center">
              <div className="text-[10px] text-slate-400">今日事故總計</div>
              <div className="text-xl font-mono font-bold text-orange-400">12<span className="text-xs">件</span></div>
            </div>
            <div className="flex-1 text-center border-l border-slate-700">
              <div className="text-[10px] text-slate-400">大眾運輸準點率</div>
              <div className="text-xl font-mono font-bold text-emerald-400">94<span className="text-xs">%</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600 shadow-inner">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          政策模擬與審核
        </h2>
        
        <div className="space-y-3">
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="flex gap-2 items-start mb-2">
              <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold text-slate-200">信義商圈假日行人徒步區擴大</div>
                <div className="text-[10px] text-slate-400 mt-1">AI 模擬結果：周邊道路壅塞度將提升 15%，建議配套增加公車班次。</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" /> 批准執行
              </button>
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-1.5 rounded transition-colors">
                退回重擬
              </button>
            </div>
          </div>

          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="flex gap-2 items-start mb-2">
              <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold text-slate-200">基隆路尖峰時段調降速限至 40km</div>
                <div className="text-[10px] text-slate-400 mt-1">AI 模擬結果：可降低 22% 事故率，整體車流延滯時間僅增加 3%。</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" /> 批准執行
              </button>
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-1.5 rounded transition-colors">
                退回重擬
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-yellow-400 mt-4 bg-yellow-400/10 p-2 rounded">
        註：硬體設備即時模擬（如紅綠燈動態秒數）請切換至「模擬控制」身分視角。
      </div>
    </div>
  );
}
