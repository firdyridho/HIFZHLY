package model

// WebResponse format standar JSON respon API
type WebResponse struct {
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// ErrorResponse format standar saat terjadi kegagalan HTTP
type ErrorResponse struct {
	Error string `json:"error"`
}

