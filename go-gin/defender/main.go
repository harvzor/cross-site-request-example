package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://attacker.local"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Content-Type", "custom-header"},
		AllowCredentials: true,
	}))

	r.GET("/", indexHandler)
	r.GET("/get", getHandler)
	r.POST("/post", postHandler)

	log.Fatal(r.RunTLS(":3000", "./certs/cert.pem", "./certs/key.pem"))
}

func indexHandler(c *gin.Context) {
	// Only 'none' seems to work with synchronous POST
	// Also, the Fetch docs say:
	// > Note that if a cookie's SameSite attribute is set to Strict or Lax, then the cookie will not be sent cross-site, even if credentials is set to include.
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie(
		"secure-cookie",
		"secure-cookie-value",
		int(time.Hour*1000/time.Second),
		"/",
		".defender.local",
		true,
		// https://stackoverflow.com/a/67001424 claims that this is important, but in my testing, it did not make a difference.
		false,
	)

	c.String(http.StatusOK, "Cookie set!")
}

func getHandler(c *gin.Context) {
	type Request struct {
		GetContent string `form:"get_content"`
	}

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

	response := Response{
		Cookies: ResponseCookies{
			SecureCookie: "",
		},
		RequestQuery: ResponseQuery{
			GetContent: "",
		},
	}

	var request Request
	if c.ShouldBind(&request) == nil {
		response.RequestQuery.GetContent = request.GetContent
	}

	secureCookie, secureCookieErr := c.Cookie("secure-cookie")

	if secureCookieErr == nil {
		response.Cookies.SecureCookie = secureCookie
	}

	c.JSON(http.StatusOK, response)
}

func postHandler(c *gin.Context) {
	type Request struct {
		PostContent string `form:"post_content"`
	}

	type ResponseCookies struct {
		SecureCookie string `json:"secure-cookie"`
	}

	type PostContent struct {
		PostContent string `json:"post_content"`
	}

	type Response struct {
		Cookies     ResponseCookies `json:"cookies"`
		PostContent PostContent     `json:"postContent"`
	}

	response := Response{
		Cookies: ResponseCookies{
			SecureCookie: "",
		},
		PostContent: PostContent{
			PostContent: "",
		},
	}

	var request Request
	if c.ShouldBind(&request) == nil {
		response.PostContent.PostContent = request.PostContent
	}

	secureCookie, secureCookieErr := c.Cookie("secure-cookie")

	if secureCookieErr == nil {
		response.Cookies.SecureCookie = secureCookie
	}

	c.JSON(http.StatusOK, response)
}
