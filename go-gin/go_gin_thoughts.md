# Go Gin Thoughts

- return JSON is nicer than using net/http
- binding request form/query params to an object is easy
- don't like that there's no way to know what the function expects before actually reading the whole function
- setting cookies is weird as you can't pass in a Cookie object, but internally it uses them
  - also you use `c.SetSameSite(http.SameSiteNoneMode)` which then decides it for all following cookie sets, gross
- `gin-contrib/cors` makes handing CORS a little simpler and less error-prone
