package constants

type DeviceState string

const (
	Booting                DeviceState = "BOOTING"
	CheckingNetwork        DeviceState = "CHECKING_NETWORK"
	NetworkConnected       DeviceState = "NETWORK_CONNECTED"
	ConnectingControlPlane DeviceState = "CONNECTING_TO_CONTROL_PLANE_SERVER"
	DeviceActivation       DeviceState = "DEVICE_ACTIVATION"
	QRPairing              DeviceState = "QR_PAIRING"
	Dashboard              DeviceState = "DASHBOARD"
)
