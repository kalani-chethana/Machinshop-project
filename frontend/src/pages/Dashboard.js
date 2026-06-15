import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme-mode');
    return saved ? JSON.parse(saved) : true; 
  });

  useEffect(() => {
    localStorage.setItem('dashboard-theme-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // SYSTEM DATA ENGINE MATRIX
  const [jobsData, setJobsData] = useState([
    { id: 'JOB-001', title: 'Shaft Coupling (Flange A)', machine: 'CNC-01', staff: 'Mohd Faiz', status: 'RUNNING', initQty: 120, inScale: 50, outScale: 69, processing: 1, elapsed: 4.5, standard: 4.0 },
    { id: 'JOB-002', title: 'Bearing Housing (60mm)', machine: 'LATHE-02', staff: 'Razlan Yusof', status: 'COMPLETED', initQty: 80, inScale: 0, outScale: 80, processing: 0, elapsed: 2.8, standard: 3.0 },
    { id: 'JOB-003', title: 'Gear Blank (Module 3)', machine: 'MILL-01', staff: 'Hairul Anuar', status: 'PAUSED', initQty: 200, inScale: 150, outScale: 50, processing: 0, elapsed: 8.2, standard: 7.5 },
    { id: 'JOB-004', title: 'Drive Shaft Spacer', machine: 'CNC-02', staff: 'Ahmad Razif', status: 'RUNNING', initQty: 120, inScale: 100, outScale: 19, processing: 1, elapsed: 1.2, standard: 1.5 }
  ]);

  const [machines] = useState([
    { id: 'CNC-01', name: 'Haas 3-Axis Milling', status: 'RUNNING', job: 'JOB-001', startupTime: '06:30 AM' },
    { id: 'CNC-02', name: 'Doosan Turning Lathe', status: 'RUNNING', job: 'JOB-004', startupTime: '07:15 AM' },
    { id: 'LATHE-02', name: 'Mazak Engine Lathe', status: 'IDLE', job: 'NONE', startupTime: '08:00 AM' },
    { id: 'LATHE-03', name: 'Okuma CNC Lathe', status: 'BROKEN', job: 'NONE', startupTime: 'Emergency Stop' },
    { id: 'MILL-01', name: 'Bridgeport Knee Mill', status: 'FREE', job: 'NONE', startupTime: 'Offline' }
  ]);

  const operators = [
    { name: 'Mohd Faiz', role: 'CNC Operator', status: 'WORKING', assignment: 'JOB-001', doneToday: 2 },
    { name: 'Razlan Yusof', role: 'Turn Specialist', status: 'FREE', assignment: 'NONE', doneToday: 4 },
    { name: 'Hairul Anuar', role: 'Apprentice', status: 'FREE', assignment: 'NONE', doneToday: 0 },
    { name: 'Ahmad Razif', role: 'Shop Supervisor', status: 'WORKING', assignment: 'JOB-004', doneToday: 1 }
  ];

  useEffect(() => {
    const internalTimer = setInterval(() => {
      setJobsData(prevJobs =>
        prevJobs.map(job => 
          job.status === 'RUNNING'
            ? { ...job, elapsed: Number((job.elapsed + 0.01).toFixed(2)) }
            : job
        )
      );
    }, 5000);
    return () => clearInterval(internalTimer);
  }, []);

  return (
    <div className={`min-h-screen flex font-sans antialiased transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0f172a] text-[#cbd5e1]' : 'bg-[#f4fbf7] text-slate-800'
    }`}>
      
      {/* LEFT SIDEBAR PANEL */}
      <aside className={`w-64 flex flex-col justify-between p-4 shrink-0 transition-colors ${
        isDarkMode ? 'bg-[#1e293b] border-r border-slate-800' : 'bg-[#eef7f2] border-r border-[#dee9e2]'
      }`}>
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <span className="text-[#00a651] text-xl font-black">3S</span>
            <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Fabrications</span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {[
              { id: 'OVERVIEW', label: 'Dashboard Overview', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /> },
              { id: 'JOBS', label: 'Production Jobs', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
              { id: 'MACHINES', label: 'Hardware Hub', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" /> },
              { id: 'EMPLOYEES', label: 'Team Matrix', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
              { id: 'MATERIAL', label: 'Loadcell Logistics', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /> },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isSelected 
                      ? 'bg-[#00a651] text-white shadow-sm' 
                      : isDarkMode 
                        ? 'text-slate-400 hover:bg-[#334155] hover:text-white' 
                        : 'text-slate-700 hover:bg-[#e4f0e9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {tab.icon}
                    </svg>
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Account Profile row */}
        <div className={`flex items-center justify-between p-2 rounded-xl border ${
          isDarkMode ? 'bg-[#111827]/40 border-slate-800' : 'bg-[#e4f0e9]/60 border-[#dee9e2]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              AR
            </div>
            <div>
              <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Ahmad Razif</div>
              <div className="text-[10px] text-slate-500 font-medium">it-supervisor</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-red-500 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR SYSTEM ACTIONS */}
        <header className={`h-14 flex items-center justify-between px-8 shrink-0 border-b transition-colors ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-400' : 'bg-white border-[#dee9e2] text-slate-600'
        }`}>
          <div className="flex items-center gap-6">
            <button className="hover:text-emerald-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <span className={`h-4 w-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="hover:text-emerald-500 transition-colors">
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.343l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-75">Workcell Matrix Control Panel</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-full bg-[#00a651]/10 border border-[#00a651]/20 flex items-center justify-center text-xs font-bold text-[#00a651]">A</div>
          </div>
        </header>

        {/* CONTAINER DISPLAY CANVAS */}
        <main className="flex-1 p-8 overflow-y-auto w-full mx-auto space-y-6">
          
          {/* QUICK SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Registered Runs', count: jobsData.length, color: isDarkMode ? 'text-white' : 'text-slate-800' },
              { title: 'Active Workcells', count: machines.filter(m => m.status === 'RUNNING').length, color: 'text-blue-500' },
              { title: 'Idle Machinery', count: machines.filter(m => m.status === 'IDLE').length, color: 'text-amber-500' },
              { title: 'Free Hardware', count: machines.filter(m => m.status === 'FREE').length, color: 'text-emerald-500' },
              { title: 'Active Procedures', count: jobsData.filter(j => j.status === 'RUNNING').length, color: 'text-blue-400' },
            ].map((card, i) => (
              <div key={i} className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
                isDarkMode ? 'bg-[#111c36] border-slate-800' : 'bg-white border-[#dee9e2]'
              }`}>
                <span className="text-[11px] font-bold text-slate-400 tracking-tight uppercase">{card.title}</span>
                <span className={`text-2xl font-bold tracking-tight mt-2 ${card.color}`}>{card.count}</span>
              </div>
            ))}
          </div>

          {/* ==================== CANVAS VIEWPORT: WORKCELL HARDWARE DASHBOARD ==================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hardware Cluster Runtime Control</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time balancing of active workcell nodes, execution workflows, output matrices, and OEE parameters.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-medium opacity-80">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Live Telemetry Linked
                </div>
              </div>

              {/* MACHINE MATRIX STATUS DATA TABLE CONTAINER */}
              <div className={`rounded-2xl border shadow-sm overflow-hidden ${
                isDarkMode ? 'bg-[#111c36] border-slate-800' : 'bg-white border-[#dee9e2]'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`text-[11px] font-bold uppercase tracking-wider border-b font-mono ${
                        isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-[#e4f0e9]/50 border-[#dee9e2] text-slate-600'
                      }`}>
                        <th className="py-3.5 px-5">Machine / Cell Node</th>
                        <th className="py-3.5 px-4">Operating Status</th>
                        <th className="py-3.5 px-4">Assigned Task / Operator</th>
                        <th className="py-3.5 px-4 text-center">Output Yield / Balance Matrix</th>
                        <th className="py-3.5 px-4 text-center">Active Running Time</th>
                        <th className="py-3.5 px-5 text-right">Yield Efficiency (OEE)</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs font-medium ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200/60'}`}>
                      {machines.map((machine) => {
                        const activeJob = jobsData.find(job => job.id === machine.job || (machine.job === 'NONE' && job.machine === machine.id));
                        
                        // DYNAMIC ROW HIGHLIGHT MATRIX
                        let rowBgStyle = '';
                        let badgeStyle = '';
                        let statusDot = '';

                        if (machine.status === 'RUNNING') {
                          rowBgStyle = isDarkMode ? 'bg-blue-950/20 hover:bg-blue-950/30' : 'bg-blue-500/[0.04] hover:bg-blue-500/[0.08]';
                          badgeStyle = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
                          statusDot = 'bg-blue-500 animate-pulse';
                        } else if (machine.status === 'IDLE') {
                          rowBgStyle = isDarkMode ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]';
                          badgeStyle = 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
                          statusDot = 'bg-amber-500';
                        } else if (machine.status === 'BROKEN') {
                          rowBgStyle = isDarkMode ? 'bg-rose-950/30 hover:bg-rose-950/40 border-y border-rose-500/30' : 'bg-rose-500/[0.08] hover:bg-rose-500/[0.12] border-y border-rose-200';
                          badgeStyle = 'bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black';
                          statusDot = 'bg-rose-500 animate-ping';
                        } else {
                          // FREE row
                          rowBgStyle = isDarkMode ? 'hover:bg-slate-900/30' : 'hover:bg-slate-50/60';
                          badgeStyle = isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-500 border border-slate-200';
                          statusDot = 'bg-slate-400';
                        }

                        const processedCount = activeJob ? (activeJob.inScale + activeJob.outScale) : 0;
                        const remainingCount = activeJob ? Math.max(0, activeJob.initQty - (processedCount + activeJob.processing)) : 0;
                        const targetCount = activeJob ? activeJob.initQty : 0;
                        const oeeScore = activeJob ? Math.round((activeJob.standard / activeJob.elapsed) * 100) : 0;

                        return (
                          <tr key={machine.id} className={`transition-colors ${rowBgStyle}`}>
                            
                            {/* MACHINE IDENTIFICATION NODE */}
                            <td className="py-4 px-5">
                              <div className="flex flex-col">
                                <span className={`font-mono text-[10px] font-bold tracking-tight w-fit px-1.5 py-0.5 rounded mb-1 ${
                                  machine.status === 'BROKEN' 
                                    ? 'bg-rose-500/20 text-rose-500' 
                                    : isDarkMode ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-100 text-slate-600'
                                }`}>{machine.id}</span>
                                <span className={`font-bold ${
                                  machine.status === 'BROKEN' ? 'text-rose-500' : isDarkMode ? 'text-white' : 'text-slate-800'
                                }`}>{machine.name}</span>
                                <span className="text-[10px] text-slate-500 mt-0.5 font-mono">Boot: {machine.startupTime}</span>
                              </div>
                            </td>

                            {/* OPERATIONAL STATUS TAG */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${badgeStyle}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                                {machine.status}
                              </span>
                            </td>

                            {/* TASK ROUTING & PERSONNEL FIELD */}
                            <td className="py-4 px-4">
                              {machine.status === 'BROKEN' ? (
                                <span className="text-rose-500 font-bold font-mono text-[11px] flex items-center gap-1">
                                  ⚠️ MECHANICAL CRITICAL FAULT
                                </span>
                              ) : machine.status !== 'FREE' && activeJob ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold px-1 rounded bg-emerald-500/10 text-[#00a651] border border-emerald-500/20">{activeJob.id}</span>
                                    <span className={`font-semibold truncate max-w-[150px] ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{activeJob.title}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500">Staff: <span className="font-semibold text-slate-400">{activeJob.staff}</span></div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic font-mono text-[11px]">No Active Production Line</span>
                              )}
                            </td>

                            {/* QUANTITY TRACKER MATRIX */}
                            <td className="py-4 px-4">
                              {machine.status !== 'FREE' && machine.status !== 'BROKEN' && activeJob ? (
                                <div className="flex flex-col items-center justify-center space-y-1">
                                  <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px] w-full max-w-[180px]">
                                    <div className="p-1 rounded bg-[#00a651]/5 text-[#00a651] border border-[#00a651]/10">
                                      <span className="block text-[8px] uppercase text-slate-400 font-sans font-bold">Yield</span>
                                      <strong>{processedCount}</strong>
                                    </div>
                                    <div className={`p-1 rounded border ${isDarkMode ? 'bg-blue-950/20 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                      <span className="block text-[8px] uppercase text-slate-400 font-sans font-bold">Chmbr</span>
                                      <strong>{activeJob.processing}</strong>
                                    </div>
                                    <div className={`p-1 rounded border ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200/60 text-slate-700'}`}>
                                      <span className="block text-[8px] uppercase text-slate-400 font-sans font-bold">Rem</span>
                                      <strong>{remainingCount}</strong>
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500">Target Ceiling Run Capacity: <span className="font-mono font-bold text-slate-400">{targetCount}</span></div>
                                </div>
                              ) : (
                                <div className="text-center text-slate-400 font-mono text-[11px]">—</div>
                              )}
                            </td>

                            {/* ACTIVE NODE RUNNING TIME TRACKER */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              {machine.status === 'RUNNING' && activeJob ? (
                                <div className="inline-block font-mono">
                                  <div className="text-sm font-bold text-amber-500">{activeJob.elapsed}h</div>
                                  <div className="text-[9px] text-slate-500 font-sans">Plan Cap: {activeJob.standard}h</div>
                                </div>
                              ) : machine.status === 'IDLE' && activeJob ? (
                                <div className="inline-block font-mono opacity-60">
                                  <div className="text-sm font-bold text-slate-400">{activeJob.elapsed}h</div>
                                  <div className="text-[9px] text-slate-500 font-sans">Suspended</div>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">Offline</span>
                              )}
                            </td>

                            {/* OEE PERFORMANCE GAUGES */}
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              {machine.status !== 'FREE' && machine.status !== 'BROKEN' && activeJob ? (
                                <div className="inline-flex flex-col items-end">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-mono font-black text-sm ${oeeScore >= 100 ? 'text-[#00a651]' : 'text-amber-500'}`}>{oeeScore}%</span>
                                    <span className={`text-[8px] font-bold uppercase px-1 rounded ${oeeScore >= 100 ? 'bg-[#00a651]/10 text-[#00a651]' : 'bg-amber-500/10 text-amber-500'}`}>
                                      {oeeScore >= 100 ? 'Optimal' : 'Lagging'}
                                    </span>
                                  </div>
                                  <div className={`w-24 h-1.5 rounded-full mt-1 overflow-hidden border ${isDarkMode ? 'bg-slate-800/60 border-slate-700/20' : 'bg-slate-100 border-slate-200'}`}>
                                    <div 
                                      className={`h-full rounded-full ${oeeScore >= 100 ? 'bg-[#00a651]' : 'bg-amber-500'}`}
                                      style={{ width: `${Math.min(oeeScore, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">0%</span>
                              )}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CANVAS VIEWPORT: PRODUCTION JOBS ==================== */}
          {activeTab === 'JOBS' && (
            <div className={`rounded-2xl border shadow-xs overflow-hidden ${
              isDarkMode ? 'bg-[#111c36] border-slate-800' : 'bg-white border-[#dee9e2]'
            }`}>
              <div className="p-5 border-b border-slate-800/20 flex justify-between items-center">
                <h3 className="font-bold text-sm">Specification Assignment Ledger</h3>
                <span className="text-xs text-[#00a651] font-semibold bg-[#00a651]/10 px-2.5 py-0.5 rounded-full">Active Registry</span>
              </div>
              <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200/60'}`}>
                {jobsData.map((job, i) => (
                  <div key={i} className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors ${
                    isDarkMode ? 'hover:bg-slate-900/20' : 'hover:bg-slate-50/40'
                  }`}>
                    <div className="w-full lg:w-1/4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5 ${
                        isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>{job.id}</span>
                      <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{job.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Workcell Host: <span className="font-semibold text-[#00a651]">{job.machine}</span></p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center lg:w-1/3">
                      <div className={`p-2 border rounded-lg ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Target</span>
                        <span className="text-sm font-bold mt-0.5 block">{job.initQty}</span>
                      </div>
                      <div className="p-2 bg-[#00a651]/5 border border-[#00a651]/20 rounded-lg">
                        <span className="text-[10px] text-[#00a651] font-bold block uppercase">Finished</span>
                        <span className="text-sm font-bold text-[#00a651] mt-0.5 block">{job.inScale + job.outScale}</span>
                      </div>
                      <div className={`p-2 border rounded-lg ${isDarkMode ? 'bg-blue-950/20 border-blue-900/40 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                        <span className="text-[10px] font-bold block uppercase opacity-80">Chamber</span>
                        <span className="text-sm font-bold mt-0.5 block">{job.processing}</span>
                      </div>
                    </div>

                    <div className="text-xs lg:text-center space-y-1">
                      <div className="text-slate-400">OEE Time Performance:</div>
                      <div className="font-medium"><span className="text-amber-500 font-bold">{job.elapsed}h</span> / {job.standard}h</div>
                    </div>

                    <div className="lg:text-right">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        job.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        job.status === 'PAUSED' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-[#00a651]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          job.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                          job.status === 'PAUSED' ? 'bg-amber-500' : 'bg-[#00a651]'
                        }`} />
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== CANVAS VIEWPORT: HARDWARE HUB ==================== */}
          {activeTab === 'MACHINES' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {machines.map((mac, i) => (
                <div key={i} className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between h-42 ${
                  mac.status === 'BROKEN' 
                    ? 'border-rose-500 bg-rose-500/[0.04]' 
                    : isDarkMode ? 'bg-[#111c36] border-slate-800' : 'bg-white border-[#dee9e2]'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">{mac.id}</span>
                      <h4 className={`text-sm font-bold mt-0.5 ${mac.status === 'BROKEN' ? 'text-rose-500' : isDarkMode ? 'text-white' : 'text-slate-800'}`}>{mac.name}</h4>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${
                      mac.status === 'RUNNING' ? 'bg-blue-500' :
                      mac.status === 'IDLE' ? 'bg-amber-400' : 
                      mac.status === 'BROKEN' ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} />
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800/10">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Live Run Target</span>
                    <span className={`text-xs font-semibold block mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{mac.job}</span>
                  </div>

                  <span className={`text-[10px] font-bold uppercase text-center py-1 rounded-md mt-2 ${
                    mac.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500' :
                    mac.status === 'IDLE' ? 'bg-amber-500/10 text-amber-500' : 
                    mac.status === 'BROKEN' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/10 text-[#00a651]'
                  }`}>{mac.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* ==================== CANVAS VIEWPORT: TEAM MATRIX ==================== */}
          {activeTab === 'EMPLOYEES' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {operators.map((op, i) => (
                <div key={i} className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between h-40 ${
                  isDarkMode ? 'bg-[#111c36] border-slate-800' : 'bg-white border-[#dee9e2]'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{op.name}</h4>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{op.role}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      op.status === 'WORKING' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-[#00a651]'
                    }`}>{op.status === 'WORKING' ? 'BUSY' : 'READY'}</span>
                  </div>

                  <div className="text-xs pt-2 border-t border-slate-800/10 space-y-1">
                    <div className="text-slate-500">Pipeline Target: <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{op.assignment}</span></div>
                    <div className="text-slate-500">Completed Shifts: <span className="font-bold text-[#00a651]">{op.doneToday}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ==================== CANVAS VIEWPORT: LOADCELL LOGISTICS ==================== */}
          {activeTab === 'MATERIAL' && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl shadow-xs text-xs flex items-start gap-3 ${
                isDarkMode ? 'bg-[#111c36]/40 border-slate-800 text-slate-400' : 'bg-white border-[#dee9e2] text-slate-600'
              }`}>
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p>
                  <strong className="text-[#00a651]">Conservation of Mass Balancing:</strong> Real-time scale metrics must balance correctly across checking matrix fields to secure structural data integrity.
                  <span className="block font-medium text-slate-500 mt-1">Mathematical Rule: Input Quantity = In-Scale Load + Out-Scale Load + Active Chamber Units</span>
                </p>
              </div>

              {jobsData.map((job, i) => {
                const totalOutputCalculated = job.inScale + job.outScale + job.processing;
                const isSystemBalanced = job.initQty === totalOutputCalculated;

                return (
                  <div key={i} className={`p-5 rounded-2xl border shadow-xs flex flex-col gap-5 ${
                    isDarkMode ? 'bg-[#111c36] border-slate-800' : 'bg-white border-[#dee9e2]'
                  } ${!isSystemBalanced && 'border-rose-500/40 bg-rose-500/[0.02]'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>{job.id}</span>
                        <h4 className={`text-sm font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{job.title}</h4>
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        isSystemBalanced ? 'bg-emerald-500/10 text-[#00a651]' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {isSystemBalanced ? '✓ Scale Metrics Balanced' : '🗙 Material Variance Error'}
                      </span>
                    </div>

                    {/* BALANCER CELL PARAMETERS ROW */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                      {[
                        { title: 'Initial Input', value: job.initQty, bg: isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200' },
                        { title: 'In-Scale Metrics', value: `+${job.inScale}`, bg: 'bg-[#00a651]/5 border-[#00a651]/10 text-[#00a651]' },
                        { title: 'Out-Scale Weight', value: `+${job.outScale}`, bg: 'bg-amber-500/5 border-amber-500/10 text-amber-500' },
                        { title: 'Active Chamber', value: `+${job.processing}`, bg: 'bg-blue-500/5 border-blue-500/10 text-blue-500' },
                      ].map((cell, idx) => (
                        <div key={idx} className={`p-3 border rounded-xl ${cell.bg}`}>
                          <span className="text-[10px] font-bold text-slate-400 block tracking-tight uppercase">{cell.title}</span>
                          <span className="text-base font-bold mt-1 block font-mono">{cell.value}</span>
                        </div>
                      ))}
                      
                      <div className={`p-3 border rounded-xl md:col-span-1 col-span-2 ${
                        isSystemBalanced ? 'bg-[#00a651]/10 border-[#00a651]/20 text-[#00a651]' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}>
                        <span className="text-[10px] font-bold block tracking-tight uppercase opacity-80">Sum Total Output</span>
                        <span className="text-base font-extrabold mt-1 block font-mono">{totalOutputCalculated}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}