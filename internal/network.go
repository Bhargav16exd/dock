package internal

import (
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"time"
)

func IsNetworkAvailable() bool {
	_, err := net.Dial("tcp", "8.8.8.8:53")
	if err != nil {
		log.Println("no network available")
		return false
	}
	return true
}

func CheckIsControlPlaneServerReachable() bool {
	_, err := http.Get(FetchConfig().ServerHost + "/health")

	if err != nil {
		log.Println("control plane not reachable")
		return false
	}
	return true
}

func GetNetworkSpeed() float64 {
	url := "https://speed.cloudflare.com/__down?bytes=1000000" // 1MB test file
	start := time.Now()

	resp, err := http.Get(url)
	if err != nil {
		return 0
	}
	defer resp.Body.Close()

	n, err := io.Copy(io.Discard, resp.Body)
	if err != nil {
		return 0
	}

	elapsed := time.Since(start).Seconds()
	mbps := (float64(n) * 8) / (elapsed * 1_000_000) // convert bytes to Mbps
	return math.Round(mbps*100) / 100                // round to 2 decimal places
}
