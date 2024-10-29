using System.Net.Mime;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy
                .AllowCredentials()
                .WithOrigins("https://attacker.local")
                .WithHeaders("Content-Type",
                    "custom-header");
        });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseDeveloperExceptionPage();
app.UseHttpsRedirection();
app.UseCors();
app.MapControllers();

app.Run();

[ApiController]
[Route("/")]
public class IndexController : ControllerBase
{
    [HttpGet]
    public ContentResult Get(IConfiguration configuration)
    {
        var hostname = configuration["ASPNETCORE_URLS"]!.Split(";")
            .First();
        var url = new Uri(hostname);

        // Add the cookie to the response cookie collection
        HttpContext.Response.Cookies.Append(
            "secure-cookie",
            "secure-cookie-value",
            new CookieOptions
            {
                // Only 'none' seems to work with synchronous POST
                // Also, the Fetch docs say:
                // > Note that if a cookie's SameSite attribute is set to Strict or Lax, then the cookie will not be sent cross-site, even if credentials is set to include.
                SameSite = SameSiteMode.None,
                Secure = true,
                MaxAge = new TimeSpan(1000, 0, 0),
                Domain = $".{url.Host}", // Does not seem to matter.
                // https://stackoverflow.com/a/67001424 claims that this is important, but in my testing, it did not make a difference.
                HttpOnly = false
            }
        );

        return new ContentResult
        {
            Content = "Cookie set!",
            ContentType = MediaTypeNames.Text.Html,
        };
    }
}

[ApiController]
[Route("[controller]")]
public class GetController : ControllerBase
{
    [HttpGet]
    public JsonResult Get([FromQuery(Name = "get_content")] string getContent)
    {
        return new JsonResult(new JsonObject
        {
            ["cookies"] = new JsonObject
            {
                ["secure-cookie"] = HttpContext.Request.Cookies.FirstOrDefault(x => x.Key == "secure-cookie").Value
            },
            ["requestQuery"] = new JsonObject
            {
                ["get_content"] = getContent
            }
        });
    }
}

[ApiController]
[Route("[controller]")]
public class PostController : ControllerBase
{
    [HttpPost]
    public JsonResult Get([FromForm(Name = "post_content")] string postContent)
    {
         return new JsonResult(new JsonObject
         {
             ["cookies"] = new JsonObject
             {
                 ["secure-cookie"] = HttpContext.Request.Cookies.FirstOrDefault(x => x.Key == "secure-cookie").Value
             },
             ["requestBody"] = new JsonObject
             {
                 ["post_content"] = postContent
             }
         });
    }
}