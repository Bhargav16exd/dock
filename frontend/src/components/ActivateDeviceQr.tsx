import { useEffect, useState } from "react"
import QRCode from "react-qr-code"

const COUNTER_DURATION = 5

interface ActivateDeviceQrProps {
  data: string | null
  resetSignal: number
}

function ActivateDeviceQr({ data, resetSignal }: ActivateDeviceQrProps) {

  const [timeLeft, setTimeLeft] = useState(COUNTER_DURATION)

  useEffect(() => {
    setTimeLeft(COUNTER_DURATION)
  }, [resetSignal])

  useEffect(() => {
    if (!data || timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [data, timeLeft])

  const isExpired = timeLeft === 0
  const progress = timeLeft / COUNTER_DURATION

  if (!data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="bg-[#0A0A0A] h-screen w-screen flex flex-col items-center justify-center gap-8 font-mono select-none">

      {/* QR Card */}
      <div className="relative bg-white rounded-2xl p-8 flex items-center justify-center" style={{ width: 360, height: 360 }}>
        {isExpired && (
          <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center z-10 gap-2">
            <span className="text-black text-sm font-bold tracking-widest uppercase">Expired</span>
            <span className="text-black/50 text-xs">Waiting for new code…</span>
          </div>
        )}
        <QRCode
          value={data}
          size={600}
          bgColor="#FFFFFF"
          fgColor="#000000"
          style={{ opacity: isExpired ? 0.15 : 1, transition: "opacity 0.3s" }}
        />
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-white text-3xl font-bold tracking-tight">Scan to Pair</h1>
        <p className="text-white/50 text-sm">Open the mobile app and scan this code</p>
      </div>


      {/* Countdown ring + status */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke={isExpired ? "#ef4444" : "#ffffff"}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: isExpired ? "#ef4444" : "white" }}>
            {timeLeft}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isExpired ? "#ef4444" : "#ffffff",
              boxShadow: isExpired ? "0 0 6px #ef4444" : "0 0 6px rgba(255,255,255,0.6)",
            }}
          />
          <span className="text-white/60 text-sm">
            {isExpired ? "Code expired" : "Waiting for pairing"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ActivateDeviceQr