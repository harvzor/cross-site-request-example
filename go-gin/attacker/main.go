package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.File("index.html")
	})
	log.Fatal(r.RunTLS(":443", "./certs/cert.pem", "./certs/key.pem"))
}
