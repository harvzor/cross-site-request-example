var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseDeveloperExceptionPage();

app.UseHttpsRedirection();

app.MapGet("/", async () =>
{
    using StreamReader reader = new("index.html");
    
    var text = await reader.ReadToEndAsync();
    
    return Results.Content(text, "text/html"); 
});

app.Run();
