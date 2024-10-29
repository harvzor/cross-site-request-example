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
                .WithHeaders("Content-Type", "custom-header");
        });
});

var app = builder.Build();

app.UseDeveloperExceptionPage();
app.UseHttpsRedirection();
app.UseCors();

app
    .MapGet("/", (HttpContext context, IConfiguration configuration) =>
    {
        var hostname = configuration["ASPNETCORE_URLS"]!.Split(";").First();
        var url = new Uri(hostname);

        // Add the cookie to the response cookie collection
        context.Response.Cookies.Append(
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

        return Results.Content("Cookie set!", "text/html");
    });

app
    .MapGet("/get", (HttpContext context, [FromQuery(Name = "get_content")] string getContent) =>
    {
        return Results.Json(new JsonObject
        {
            ["cookies"] = new JsonObject
            {
                ["secure-cookie"] = context.Request.Cookies.FirstOrDefault(x => x.Key == "secure-cookie").Value
            },
            ["requestQuery"] = new JsonObject
            {
                ["get_content"] = getContent
            }
        });
    });

app
    .MapPost("/post", (
        HttpContext context,
        [FromForm(Name = "post_content")]
        string postContent) =>
    {
        return Results.Json(new JsonObject
        {
            ["cookies"] = new JsonObject
            {
                ["secure-cookie"] = context.Request.Cookies.FirstOrDefault(x => x.Key == "secure-cookie").Value
            },
            ["requestBody"] = new JsonObject
            {
                ["post_content"] = postContent
            }
        });
    })
    .DisableAntiforgery();

app.Run();