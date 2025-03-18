using System.Text.Json.Serialization;
using Backend.Apis.Drinks;
using Backend.Apis.Ingredients;
using Backend.Services.DatabaseService;
using Backend.Services.PumpService;
using Backend.Services.QueueService;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);


builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

//services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddLogging();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

//custom services
builder.Services.AddSingleton<GpioController>();
builder.Services.AddSingleton<PumpManager>();
builder.Services.AddSingleton<QueueManager>();

//swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "Api";
    config.Title = "Api v1";
    config.Version = "v1";
});

var app = builder.Build();

// app.Urls.Add("http://192.168.178.62:8080");

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "Api";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
    });
}

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();

//map apis

app
    .MapIngredientApis()
    .MapDrinkApis();

app.Run();