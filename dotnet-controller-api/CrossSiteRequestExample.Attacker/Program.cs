using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.UseDeveloperExceptionPage();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();

[ApiController]
[Route("/")]
public class IndexController : ControllerBase
{
    [HttpGet]
    public async Task<ContentResult> Get()
    {
        using StreamReader reader = new("index.html");
     
        var text = await reader.ReadToEndAsync();
        
        return new ContentResult
        {
            Content = text,
            ContentType = MediaTypeNames.Text.Html,
            StatusCode = 200
        };
    }
}
