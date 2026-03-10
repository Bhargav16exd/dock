package main

import (
	"context"
	"dock/internal"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	runtime.EventsOn(a.ctx, "frontend:ready", func(data ...interface{}) {
		go a.startApp()
	})
}

func (a *App) emit(event string, data string) {
	runtime.EventsEmit(a.ctx, event, data)
}

func (a *App) startApp() {

	//boot
	a.emit("status", "BOOTING")
	time.Sleep(time.Second * 2)

	for {
		//checking network
		a.emit("status", "CHECKING_NETWORK")
		time.Sleep(time.Second * 2)

		if internal.IsNetworkAvailable() {
			a.emit("status", "NETWORK_CONNECTED")
			break
		}
		a.emit("status", "CHECKING_NETWORK")
		time.Sleep(time.Second * 5)
	}

	a.emit("status", "CONNECTING_TO_CONTROL_PLANE_SERVER")
	time.Sleep(time.Second * 2)

	for {
		if internal.CheckIsControlPlaneServerReachable() {
			a.emit("status", "CONNECTING_TO_CONTROL_PLANE_SERVER")
			break
		}
		time.Sleep(time.Minute)
		a.emit("status", "CONNECTING_TO_CONTROL_PLANE_SERVER")
	}

	a.emit("status", "DEVICE_ACTIVATION")
	configs := internal.GetConfig()

	if !configs.IsDockActive {
		response := internal.ActivateDock()
		internal.GenerateCryptoKeys()

		// Poll until activated, emitting license key each time it's not yet active
		a.emit("status", "QR_PAIRING")
		internal.CheckIsDeviceActivated(configs, func() {
			a.emit("QR_PAIRING:QR", response.Data.DeviceLicenceKeyOne)
		})
	}

	a.emit("status", "Ready")
	a.emit("stage", "ready") // triggers a UI screen change

	go internal.CheckForDataFromServer()
	time.Sleep(time.Second * 2)
	go internal.CheckForFilesAvailable()

	a.emit("status", "DASHBOARD")
	go a.startDashboardPolling()
}

type DashboardData struct {
	DeviceStatus      string  `json:"deviceStatus"`
	InternetConnected bool    `json:"internetConnected"`
	NetworkSpeed      float64 `json:"networkSpeed"` // Mbps
	//Latency           int     `json:"latency"`      // ms
	//LastBackup        string  `json:"lastBackup"`
	StorageTotal int64 `json:"storageTotal"` // bytes
	StorageUsed  int64 `json:"storageUsed"`  // bytes
}

func (a *App) collectDashboardData() DashboardData {
	storageTotal, storageUsed := internal.GetStorageInfo()
	return DashboardData{
		DeviceStatus:      "Online",
		InternetConnected: internal.IsNetworkAvailable(),
		NetworkSpeed:      internal.GetNetworkSpeed(),
		StorageTotal:      storageTotal,
		StorageUsed:       storageUsed,
	}
}

func (a *App) startDashboardPolling() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			data := a.collectDashboardData()
			runtime.EventsEmit(a.ctx, "dashboard:data", data)
		case <-a.ctx.Done():
			return
		}
	}
}
