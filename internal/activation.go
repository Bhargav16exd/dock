package internal

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// temp
type IsDeviceActivatedInput struct {
	ProductId string `json:"product_id"`
}

type ActivateDockInput struct {
	ProductId  string `json:"product_id"`
	LicenseKey string `json:"license_key"`
	MacId      string `json:"mac_id"`
}

type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type ActivateDockResponse struct {
	Tokens
	DeviceLicenceKeyOne string `json:"device_license_key_one" bson:"device_license_key_one,omitempty"`
	DeviceLicenceKeyTwo string `json:"device_license_key_two" bson:"device_license_key_two,omitempty"`
}

var APPLICATION_JSON string = "application/json"

type ResponseType struct {
	Success    bool                 `json:"success"`
	StatusCode int                  `json:"status_code"`
	Message    string               `json:"message"`
	Data       ActivateDockResponse `json:"data"`
}

// temp
type ResponseTypeTemp struct {
	Success    bool   `json:"success"`
	StatusCode int    `json:"status_code"`
	Message    string `json:"message"`
	Data       bool   `json:"data"`
}

func ActivateDock() ResponseType {

	//fetch keys , send keys to activate api
	configs := GetConfig()

	payload := ActivateDockInput{
		ProductId:  configs.ProductId,
		LicenseKey: configs.DockLicenseKeyOne,
		MacId:      configs.MacId,
	}

	encodedPayload, err := json.Marshal(payload)

	if err != nil {
		fmt.Println(err)
	}

	bufferedPayload := bytes.NewBuffer(encodedPayload)

	encodedRes, err := http.Post(configs.ServerHost+configs.ApiActivationPath, APPLICATION_JSON, bufferedPayload)
	fmt.Println(err)

	if err != nil {
		fmt.Println(err)
	}

	defer encodedRes.Body.Close()

	response := ResponseType{}
	json.NewDecoder(encodedRes.Body).Decode(&response)

	//build tokens object
	tokens := Tokens{
		AccessToken:  response.Data.AccessToken,
		RefreshToken: response.Data.RefreshToken,
	}

	saveTokens(tokens)
	updateConfig()

	return response
}

func saveTokens(tokens Tokens) error {

	file, err := os.OpenFile("./config/token.json",
		os.O_CREATE|os.O_WRONLY|os.O_TRUNC,
		0644,
	)

	if err != nil {
		fmt.Println(err)
		return err
	}

	defer file.Close()

	encoder := json.NewEncoder(file)

	encoder.SetIndent("", "	")
	err = encoder.Encode(&tokens)

	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func CheckIsDeviceActivated(configs ConfigType, onNotActivated func()) bool {

	for {
		payload := IsDeviceActivatedInput{
			ProductId: configs.ProductId,
		}

		encodedPayload, err := json.Marshal(payload)
		if err != nil {
			fmt.Println(err)
		}

		bufferedPayload := bytes.NewBuffer(encodedPayload)

		encodedRes, err := http.Post(configs.ServerHost+configs.ApiIsDeviceActivePath, APPLICATION_JSON, bufferedPayload)
		if err != nil {
			fmt.Println(err)
			time.Sleep(time.Second * 5)
			continue
		}

		response := ResponseTypeTemp{}
		json.NewDecoder(encodedRes.Body).Decode(&response)

		defer encodedRes.Body.Close()
		if response.Data {
			return true // device is activated
		}

		// Not yet activated — fire callback so frontend can show QR
		if onNotActivated != nil {
			onNotActivated()
		}
		time.Sleep(time.Second * 5)
	}
}
