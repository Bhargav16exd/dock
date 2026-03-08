import { useEffect, useState } from "react"
import { useWailsReady } from "./hooks/useWailsReady"
import BootingScreen from "./components/BootingScreen"
import CheckingNetworkScreen from "./components/CheckingNetworkScreen"
import ConnectingControlPlaneScreen from "./components/ConnectingControlPlaneScreen"
import Dashboard from "./components/Dashboard"

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

      // Signal Go that frontend is ready
      EventsEmit("frontend:ready")

      return () => {
        unsubStatus()
        unsubDashboard()
      }
    }

    let cleanup: (() => void) | undefined
    init().then(fn => { cleanup = fn })
    return () => { cleanup?.() }

  }, [wailsReady])  // ← re-runs only when wailsReady flips to true

  return (
    <div className="h-screen w-screen">
      {renderScreen(state, dashboardData)}
    </div>
  )
}

function renderScreen(state: DeviceState, dashboardData: DashboardData | null) {
  switch (state) {
    case DeviceState.BOOTING:
      return <BootingScreen />
    case DeviceState.CHECKING_NETWORK:
      return <CheckingNetworkScreen />
    case DeviceState.CONNECTING_CONTROL_PLANE:
      return <ConnectingControlPlaneScreen />
    case DeviceState.DASHBOARD:
      return <Dashboard data={dashboardData} />
    default:
      return <Dashboard data={dashboardData} />
  }
}