using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using NewBackend.Apis.Drinks;
using NewBackend.Apis.Ingredients;
using NewBackend.Services.DatabaseService;
using NewBackend.Services.PumpService;

//env
Env.Load();
var connectionString = Env.GetString("DB_CONNECTION_STRING") ??
                       throw new ArgumentNullException($"Env.GetString(\"DB_CONNECTION_STRING\")");

var builder = WebApplication.CreateBuilder(args);

//services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddOpenApi();

//custom services
builder.Services.AddSingleton<GpioController>();
builder.Services.AddSingleton<PumpManager>();
builder.Services.AddScoped<DatabaseService>(); //has to be scoped

var app = builder.Build();


if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}

app.UseHttpsRedirection();

//map apis

app
    .MapIngredientApis()
    .MapDrinkApis();

app.Run();