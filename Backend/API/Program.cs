using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pomelo.EntityFrameworkCore.MySql;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DotNetEnv;
using API;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
var connectionString = Env.GetString("DB_CONNECTION_STRING");


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddSingleton<PumpManager>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});
builder.Services.AddControllers();
var app = builder.Build();

// app.Urls.Add("http://192.168.178.62:5000");

//Testing
app.MapGet("/startPump", async (int slot, int ml) =>
{
   // _ = Task.Run(() => PumpManager.Instance.StartPump(slot, ml));
    
    return Results.Ok($"Pump {slot} scheduled to run for {ml} ml.");
});

app.UseCors("AllowAll");
app.MapControllers();
app.Run();
