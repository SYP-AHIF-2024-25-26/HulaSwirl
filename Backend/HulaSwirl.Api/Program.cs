using System.Device.Gpio;
using System.Text;
using HulaSwirl.Api.Drinks;
using HulaSwirl.Api.Ingredients;
using HulaSwirl.Api.Users;
using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Pumps;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

//services
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var configuration = builder.Configuration;
    options.UseSqlite(configuration.GetConnectionString("DefaultConnection"));
});
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
// builder.Services.AddSingleton<QueueManager>();

builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<IOtpService, InMemoryOtpService>();

//swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "Api";
    config.Title = "Api v1";
    config.Version = "v1";
});

var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

/*
 * THIS IS FOR THE Raspberry Pi
 * CHANGE THIS WHEN DEPLOYING
*/
//app.Urls.Add("http://192.168.178.62:8080");

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

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
    .MapDrinkApis()
    .MapUserApi();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    PumpSeeder.SeedPumps(db);
    UserSeeder.SeedUsers(db);
}

app.Run();