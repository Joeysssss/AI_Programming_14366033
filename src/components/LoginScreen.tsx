import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Lock, User, AlertCircle } from 'lucide-react';

export function LoginScreen() {
  const { login, register } = useStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'POLICE' | 'MANAGEMENT'>('CITIZEN');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegistering) {
      const result = await register(username, password, role);
      if (!result.success) {
        setError(result.error || '註冊失敗');
      }
    } else {
      const success = await login(username, password);
      if (!success) {
        setError('帳號或密碼錯誤');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
            智慧交通管理系統
          </h1>
          <p className="text-slate-400 text-sm">
            {isRegistering ? '請填寫資料以註冊新帳號' : '請輸入您的帳號密碼以登入系統'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">帳號</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="輸入帳號"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="輸入密碼"
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">選擇身分</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="CITIZEN">一般民眾</option>
                <option value="POLICE">警務人員</option>
                <option value="MANAGEMENT">管理單位</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4"
          >
            {isRegistering ? '註冊並登入' : '登入'}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {isRegistering ? '已有帳號？點此登入' : '沒有帳號？點此註冊'}
            </button>
          </div>
        </form>

        {!isRegistering && (
          <div className="mt-8 pt-6 border-t border-slate-700 text-sm text-slate-400">
            <p className="mb-2 font-medium">測試帳號：</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>民眾：<code className="text-blue-300">user</code> / <code className="text-blue-300">user</code></li>
              <li>警察：<code className="text-blue-300">police</code> / <code className="text-blue-300">police</code></li>
              <li>管理單位：<code className="text-blue-300">admin</code> / <code className="text-blue-300">admin</code></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
