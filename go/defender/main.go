package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /post", postHandler)
	mux.HandleFunc("OPTIONS /post", enableCors)

	mux.HandleFunc("GET /get", getHandler)
	mux.HandleFunc("OPTIONS /get", enableCors)

	mux.HandleFunc("GET /{$}", indexHandler)

	log.Fatal(http.ListenAndServeTLS(":3000", "./certs/cert.pem", "./certs/key.pem", mux))
}

func enableCors(w http.ResponseWriter, r *http.Request) {
	(w).Header().Set("Access-Control-Allow-Origin", "https://attacker.local")
	(w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(w).Header().Set("Access-Control-Allow-Headers", "Content-Type, custom-header")
	(w).Header().Set("Access-Control-Allow-Credentials", "true")
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	cookie := http.Cookie{
		// Only 'none' seems to work with synchronous POST
		// Also, the Fetch docs say:
		// > Note that if a cookie's SameSite attribute is set to Strict or Lax, then the cookie will not be sent cross-site, even if credentials is set to include.
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
		MaxAge:   int(time.Hour * 1000 / time.Second),
		Name:     "secure-cookie",
		Value:    "secure-cookie-value",
		Domain:   ".defender.local",
		// https://stackoverflow.com/a/67001424 claims that this is important, but in my testing, it did not make a difference.
		HttpOnly: false,
	}

	// Use the http.SetCookie() function to send the cookie to the client.
	// Behind the scenes this adds a `Set-Cookie` header to the response
	// containing the necessary cookie data.
	http.SetCookie(w, &cookie)

	fmt.Fprintf(w, "Cookie set!")
}

func getHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(w, r)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	type ResponseCookies struct {
		SecureCookie string `json:"secure-cookie"`
	}

	type ResponseQuery struct {
		GetContent string `json:"get_content"`
	}

	type Response struct {
		Cookies      ResponseCookies `json:"cookies"`
		RequestQuery ResponseQuery   `json:"requestQuery"`
	}

	secureCookie, secureCookieErr := r.Cookie("secure-cookie")

	response := Response{
		Cookies: ResponseCookies{
			SecureCookie: "",
		},
		RequestQuery: ResponseQuery{
			GetContent: r.URL.Query().Get("get_content"),
		},
	}

	if secureCookieErr == nil {
		response.Cookies.SecureCookie = secureCookie.Value
	}

	encodeErr := json.NewEncoder(w).Encode(response)

	if encodeErr != nil {
		http.Error(w, fmt.Sprintf("error building the response, %v", encodeErr), http.StatusInternalServerError)
		return
	}
}

func postHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(w, r)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	type ResponseCookies struct {
		SecureCookie string `json:"secure-cookie"`
	}

	type PostContent struct {
		PostContent string `json:"get_content"`
	}

	type Response struct {
		Cookies     ResponseCookies `json:"cookies"`
		PostContent PostContent     `json:"postContent"`
	}

	secureCookie, secureCookieErr := r.Cookie("secure-cookie")

	response := Response{
		Cookies: ResponseCookies{
			SecureCookie: "",
		},
		PostContent: PostContent{
			PostContent: r.PostFormValue("post_content"),
		},
	}

	if secureCookieErr == nil {
		response.Cookies.SecureCookie = secureCookie.Value
	}

	encodeErr := json.NewEncoder(w).Encode(response)

	if encodeErr != nil {
		http.Error(w, fmt.Sprintf("error building the response, %v", encodeErr), http.StatusInternalServerError)
		return
	}
}
