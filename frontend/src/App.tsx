import { useEffect, useState } from "react"
import { useWailsReady } from "./hooks/useWailsReady"
import BootingScreen from "./components/BootingScreen"
import CheckingNetworkScreen from "./components/CheckingNetworkScreen"
import ConnectingControlPlaneScreen from "./components/ConnectingControlPlaneScreen"
import Dashboard from "./components/Dashboard"
import ActivateDeviceQr from "./components/ActivateDeviceQr"

export enum DeviceState {
  BOOTING = "BOOTING",
  CHECKING_NETWORK = "CHECKING_NETWORK",
  NETWORK_CONNECTED = "NETWORK_CONNECTED",
  CONNECTING_CONTROL_PLANE = "CONNECTING_TO_CONTROL_PLANE_SERVER",
  DEVICE_ACTIVATION = "DEVICE_ACTIVATION",
  QR_PAIRING = "QR_PAIRING",
  DASHBOARD = "DASHBOARD",
}

export interface DashboardData {
  deviceStatus: string
  internetConnected: boolean
  networkSpeed: number
  latency: number
  lastBackup: string
  storageTotal: number
  storageUsed: number
  uptime: number
}

export default function App() {
  const wailsReady = useWailsReady()
  const [state, setState] = useState<DeviceState>(DeviceState.BOOTING)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [activateDeviceQrPayload, setActivateDeviceQrPayload] = useState<string | null>(null)
  const [qrResetSignal, setQrResetSignal] = useState(0)

  useEffect(() => {
    if (!wailsReady) return   // ← wait for runtime to be injected

    const init = async () => {
      const { EventsOn, EventsEmit } = await import("../wailsjs/runtime/runtime")

      const unsubStatus = EventsOn("status", (msg: string) => {
        setState(msg as DeviceState)
      })

      const unsubDashboard = EventsOn("dashboard:data", (payload: DashboardData) => {
        setDashboardData(payload)
      })

      const unsubActivateDeviceQr = EventsOn("QR_PAIRING:QR", (payload: string) => {
        setActivateDeviceQrPayload(payload)
        setQrResetSignal((n) => n + 1)
      })

      // Signal Go that frontend is ready
      EventsEmit("frontend:ready")

      return () => {
        unsubStatus()
        unsubDashboard()
        unsubActivateDeviceQr()
      }
    }

    let cleanup: (() => void) | undefined
    init().then(fn => { cleanup = fn })
    return () => { cleanup?.() }

  }, [wailsReady])  // ← re-runs only when wailsReady flips to true

  return (
    <div className="h-screen w-screen">
      {renderScreen(state, dashboardData, activateDeviceQrPayload, qrResetSignal)}
    </div>
  )
}

function renderScreen(state: DeviceState, dashboardData: DashboardData | null, activateDeviceQrPayload: string | null, qrResetSignal: number,) {
  switch (state) {
    case DeviceState.BOOTING:
      return <BootingScreen />
    case DeviceState.CHECKING_NETWORK:
      return <CheckingNetworkScreen />
    case DeviceState.CONNECTING_CONTROL_PLANE:
      return <ConnectingControlPlaneScreen />
    case DeviceState.QR_PAIRING:
      return <ActivateDeviceQr data={activateDeviceQrPayload} resetSignal={qrResetSignal}/>
    case DeviceState.DASHBOARD:
      return <Dashboard data={dashboardData} />
    default:
      return <ActivateDeviceQr data={activateDeviceQrPayload} resetSignal={qrResetSignal}/>
  }
}