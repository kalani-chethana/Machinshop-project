import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Scale, RefreshCw, Briefcase, Info, Layers, ShieldAlert, AlertTriangle, AlertCircle } from "lucide-react";

const ScaleCard = ({ title, subTitle, value, partsCount, status, lcNumber, onReset, resettingId, colorClass, hasJob }) => {
  const isThisResetting = resettingId === lcNumber;
  const anyResetting = resettingId !== null;
  
  const isBulkWarning = status === "bulk_load_warning";
  const isUnderweight = status === "underweight_part_warning";

  const colorStyles = {
    blue: { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", btn: "bg-blue-600 hover:bg-blue-500" },
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", btn: "bg-emerald-600 hover:bg-emerald-500" }
  }[colorClass];

  let activeBorder = "border-slate-800 hover:border-slate-700/60";
  if (isBulkWarning) activeBorder = "border-rose-500/60 shadow-rose-950/20 animate-pulse bg-rose-950/10";
  if (isUnderweight) activeBorder = "border-red-500 border-2 shadow-red-950/40 bg-red-950/20";

  return (
    <div className={`bg-slate-900/60 backdrop-blur-md border rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 ${activeBorder}`}>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{subTitle}</p>
          </div>
          <div className={`p-2.5 rounded-xl border ${
            isUnderweight ? "bg-red-500 text-white border-red-400" :
            isBulkWarning ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : `${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`
          }`}>
            {isUnderweight ? <AlertTriangle className="w-5 h-5 animate-bounce" /> : isBulkWarning ? <ShieldAlert className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
          </div>
        </div>

        <div className="my-8 text-center tracking-tight">
          <span className={`text-6xl font-black font-mono transition-colors duration-200 ${
            isUnderweight ? "text-red-500 font-extrabold" : isBulkWarning ? "text-rose-400" : "text-white"
          }`}>
            {value}
          </span>
          <span className="text-lg font-medium text-slate-400 ml-2 font-sans">kg</span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Piece Count
            </span>
            <span className={`text-xl font-bold font-mono ${isUnderweight ? "text-red-400 line-through" : "text-slate-200"}`}>
              {hasJob ? `${partsCount} pcs` : "---"}
            </span>
          </div>

          {hasJob && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex flex-col gap-1 items-center text-center justify-center ${
              isUnderweight ? "bg-red-950 border-red-500 text-red-200 animate-pulse" :
              isBulkWarning ? "bg-rose-950/40 border-rose-500/30 text-rose-300" : "bg-slate-950/30 border-slate-800/80 text-slate-400"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isUnderweight ? "bg-red-400" : isBulkWarning ? "bg-rose-400" : "bg-emerald-500"}`} />
                {isUnderweight ? "CRITICAL QC ERROR" : isBulkWarning ? "PROCESS SPEED WARNING" : "SYSTEM STABLE"}
              </div>
              <p className="text-[11px] font-normal mt-0.5 opacity-90">
                {isUnderweight ? "An invalid part weight was detected! Counter frozen. Remove the bad part to unlock." :
                 isBulkWarning ? "Bulk load detected! Please load items one-by-one." : "Scale weight matches valid piece distribution values."}
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onReset(lcNumber)}
        disabled={anyResetting}
        className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
          isUnderweight ? "bg-red-700 hover:bg-red-600" : isBulkWarning ? "bg-rose-600 hover:bg-rose-500" : colorStyles.btn
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${isThisResetting ? "animate-spin" : ""}`} />
        {isThisResetting ? "Executing Reset..." : `Reset ${title}`}
      </button>
    </div>
  );
};

const Loadcell = () => {
  const [lc3, setLc3] = useState("0.000");
  const [lc4, setLc4] = useState("0.000");
  const [lc3Count, setLc3Count] = useState(0);
  const [lc4Count, setLc4Count] = useState(0);
  const [lc3Status, setLc3Status] = useState("nominal");
  const [lc4Status, setLc4Status] = useState("nominal");

  const [resettingId, setResettingId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const pollingTimeoutRef = useRef(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/jobs")
      .then((res) => { if (res.data.success) setJobs(res.data.jobs); })
      .catch((err) => console.error("Error fetching database jobs profiles:", err));
  }, []);

  const handleJobSelect = (e) => {
    const jobId = e.target.value;
    if (!jobId) { setSelectedJob(null); return; }
    const match = jobs.find((j) => j.job_id === jobId);
    setSelectedJob(match || null);
  };

  const getLoadCellData = useCallback(async () => {
    try {
      const url = selectedJob ? `http://localhost:5000/api/loadcells?jobId=${selectedJob.job_id}` : "http://localhost:5000/api/loadcells";
      const response = await axios.get(url);
      
      setLc3(response.data?.lc3?.res ?? "0.000");
      setLc4(response.data?.lc4?.res ?? "0.000");
      setLc3Count(response.data?.lc3?.partsCount ?? 0);
      setLc4Count(response.data?.lc4?.partsCount ?? 0);
      setLc3Status(response.data?.lc3?.status ?? "nominal");
      setLc4Status(response.data?.lc4?.status ?? "nominal");
    } catch (error) {
      console.error("API error polling matrix stream:", error);
    }
  }, [selectedJob]);

  useEffect(() => {
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(async () => {
        await getLoadCellData();
        startPolling();
      }, 1000);
    };
    getLoadCellData();
    startPolling();
    return () => { if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current); };
  }, [getLoadCellData]);

  const handleReset = async (lcNumber) => {
    setResettingId(lcNumber);
    try {
      await axios.post("http://localhost:5000/api/loadcells/reset", { lcNumber });
      await getLoadCellData();
    } catch (error) {
      console.error("Reset error:", error);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Load Cell Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">Latching Quality Defect Interlocking Stream</p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-64">
            <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select onChange={handleJobSelect} defaultValue="" className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none w-full cursor-pointer">
              <option value="" className="bg-slate-900 text-slate-400">-- Select Active Job --</option>
              {jobs.map((job) => (
                <option key={job.job_id} value={job.job_id} className="bg-slate-900 text-slate-100">{job.job_name} ({job.job_id})</option>
              ))}
            </select>
          </div>
        </header>

        {selectedJob ? (
          <div className="bg-blue-950/20 border border-blue-500/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 mt-0.5"><Info className="w-4 h-4" /></div>
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/10">Active Structure: {selectedJob.job_id}</span>
                <h2 className="text-xl font-bold text-white tracking-tight mt-1">{selectedJob.job_name}</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto font-mono text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <p className="text-slate-500 font-semibold uppercase text-[10px]">Target Input Wt.</p>
                <p className="text-sm font-bold text-slate-200">{parseFloat(selectedJob.input_weight_one_part).toFixed(3)} kg</p>
                <p className="text-[10px] text-slate-400 mt-0.5">±{parseFloat(selectedJob.input_tolerance).toFixed(3)}</p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <p className="text-slate-500 font-semibold uppercase text-[10px]">Target Output Wt.</p>
                <p className="text-sm font-bold text-slate-200">{parseFloat(selectedJob.output_weight_one_part).toFixed(3)} kg</p>
                <p className="text-[10px] text-slate-400 mt-0.5">±{parseFloat(selectedJob.output_tolerance).toFixed(3)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500" /> Choose an operating job profile configuration to run inline step testing validation.
          </div>
        )}

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScaleCard title="Input Scale" subTitle="Load Cell 3 (LC3)" value={lc3} partsCount={lc3Count} status={lc3Status} lcNumber={3} onReset={handleReset} resettingId={resettingId} colorClass="blue" hasJob={!!selectedJob} />
          <ScaleCard title="Output Scale" subTitle="Load Cell 4 (LC4)" value={lc4} partsCount={lc4Count} status={lc4Status} lcNumber={4} onReset={handleReset} resettingId={resettingId} colorClass="emerald" hasJob={!!selectedJob} />
        </main>
      </div>
    </div>
  );
};

export default Loadcell;