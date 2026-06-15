import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  // Pre-filled with credentials
  const [employeeId, setEmployeeId] = useState('sup001');
  const [password, setPassword] = useState('machshop@2024');

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Supervisor login attempt:', { employeeId, password });
    
    if (employeeId && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div 
      /* GRID REMOVED & BACKGROUND SWITCHED TO WHITE */
      className="min-h-screen flex flex-col items-center justify-center p-4 font-mono select-none bg-white"
    >
      {/* BRAND INTERFACE HEADER */}
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 bg-[#00a86b] rounded-xl flex items-center justify-center shadow-sm">
            {/* Minimalist Factory Icon */}
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-[0.2em] text-[#1c3d32] uppercase">
          MachinShop
        </h1>
      </div>

      {/* CORE FORM CONTAINER - COLOR OPTIMIZED FOR WHITE BACKGROUND */}
      <div className="bg-[#f7faf8] rounded-2xl border border-[#e1ede7] p-8 w-full max-w-md space-y-6">
        
        {/* HINT BANNER */}
        <div className="bg-white border border-[#d8f0e5] rounded-xl p-4 text-xs text-[#406e5d] leading-relaxed shadow-sm">
          <div className="font-semibold mb-1">
            DEMO – ID: sup001 / sup002 / sup003
          </div>
          <div>Password: machshop@2024</div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMPLOYEE ID INPUT */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold tracking-wider text-[#406e5d] uppercase">
              Employee ID
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-[#73a28f]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter supervisor ID"
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#d6e5de] rounded-xl text-sm font-semibold text-[#1c3d32] focus:outline-none focus:border-[#00a86b] transition"
                required
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold tracking-wider text-[#406e5d] uppercase">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-[#73a28f]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#d6e5de] rounded-xl text-sm font-semibold text-[#1c3d32] focus:outline-none focus:border-[#00a86b] transition tracking-widest"
                required
              />
            </div>
          </div>

          {/* ACCESS SYSTEM ACTION BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#00a86b] hover:bg-[#00945d] active:bg-[#008052] text-white font-bold tracking-widest py-3.5 px-4 rounded-xl shadow-sm transition duration-150 uppercase text-xs mt-2"
          >
            Access System
          </button>
        </form>
      </div>

      {/* COMPLIANCE FOOTER */}
      <div className="mt-6 text-[10px] tracking-widest text-[#528271] font-semibold uppercase text-center">
        Authorised Personnel Only – Production Floor System
      </div>
    </div>
  );
}