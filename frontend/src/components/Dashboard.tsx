
function Dashboard({data}:any){

    if (!data) {
        return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0A]">
            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
        </div>
        )
    }

    return(
        <div className="bg-[#0A0A0A] h-screen font-mono ">

            <div className="border-b border-[#2A2A2A] flex justify-between items-center py-6 px-4">
                <p className="text-white text-3xl tracking-tighter">Dock System</p>
                <p className="border border-[#2A2A2A] rounded-lg text-gray-200 text-sm p-2">Status: {data.deviceStatus}</p>
            </div>

            <div className="flex justify-center items-center gap-4 w-full my-10 px-4">
                <div className="border border-[#2A2A2A] rounded-lg bg-[#191919] w-1/2 p-4 flex flex-col gap-4 tracking-tighter">
                    <p className="text-gray-400 text">
                        Network Connectivity
                    </p>
                    <p className="text-white text-3xl flex">
                        {
                            data.internetConnected ? 
                            (
                                <div className="flex justify-center items-center gap-4">
                                    <p>Internet Connected</p> 
                                    <p className="h-6 w-6 bg-green-600 rounded-full"></p>
                                </div>
                            ) : 
                            (
                                <div className="flex justify-center items-center gap-4">
                                    <p>Offline</p> 
                                    <p className="h-6 w-6 bg-red-600 rounded-full"></p>
                                </div>
                            )
                        }</p>
                </div>
                <div className="border border-[#2A2A2A] rounded-lg bg-[#191919] w-1/2 p-4 flex flex-col gap-4 tracking-tighter">
                    <p className="text-gray-400 text">
                        Network Speed
                    </p>
                    <p className="text-white text-3xl">{data.networkSpeed} Mbps</p>
                </div>
            </div>

            <div className="flex justify-center items-center gap-4 w-full my-10 px-4">
                <div className="border border-[#2A2A2A] rounded-lg bg-[#191919] w-full p-4 flex flex-col gap-4 tracking-tighter">
                    <p className="text-gray-400 text">
                        STORAGE STATUS
                    </p>
                    <StorageBar storageUsed={data.storageUsed} storageTotal={data.storageTotal} />
                </div>
            </div>

        </div>
    )
}

export default Dashboard

function StorageBar({ storageUsed, storageTotal }: { storageUsed: number, storageTotal: number }) {
  const storagePercent = Math.round((storageUsed / storageTotal) * 100)
  const storageUsedGB = (storageUsed / 1e9).toFixed(1)
  const storageTotalGB = (storageTotal / 1e9).toFixed(1)

  const getColor = () => {
    if (storagePercent >= 90) return { bar: "#ef4444", glow: "#ef444466", label: "CRITICAL" }
    if (storagePercent >= 70) return { bar: "#f59e0b", glow: "#f59e0b66", label: "WARNING" }
    return { bar: "#22d3ee", glow: "#22d3ee66", label: "NOMINAL" }
  }

  const { bar, glow, label } = getColor()

  return (
    <div className="w-full p-4 rounded-lg border border-white/5 bg-black/30 font-mono space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between text-[14px] tracking-tighter s text-white/30 uppercase">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
          </svg>
          <span>Storage</span>
        </div>
        <span style={{ color: bar }}>{label}</span>
      </div>

      {/* Bar */}
      <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
        {/* Segmented tick marks */}
        {[25, 50, 75].map(tick => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-black/40 z-10"
            style={{ left: `${tick}%` }}
          />
        ))}
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative"
          style={{
            width: `${storagePercent}%`,
            background: `linear-gradient(90deg, ${bar}88, ${bar})`,
            boxShadow: `0 0 10px ${glow}`,
          }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Tick labels */}
      <div className="relative w-full flex justify-between text-[9px] text-white/15 -mt-1">
        <span>0</span>
        <span style={{ position: "absolute", left: "25%", transform: "translateX(-50%)" }}>25%</span>
        <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>50%</span>
        <span style={{ position: "absolute", left: "75%", transform: "translateX(-50%)" }}>75%</span>
        <span>100%</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: "USED", value: `${storageUsedGB} GB`, color: bar },
          { label: "FREE", value: `${(parseFloat(storageTotalGB) - parseFloat(storageUsedGB)).toFixed(1)} GB`, color: "rgba(255,255,255,0.5)" },
          { label: "TOTAL", value: `${storageTotalGB} GB`, color: "rgba(255,255,255,0.3)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center border border-white/5 rounded p-2 bg-white/[0.02]">
            <div className="text-[14px] text-white/25 tracking-widest mb-1">{label}</div>
            <div className="text-sm font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}