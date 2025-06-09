using System.Device.Gpio;
using System.Text;
using HulaSwirl.Api.Drinks;
using HulaSwirl.Api.Ingredients;
using HulaSwirl.Api.Orders;
using HulaSwirl.Api.Users;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.Pumps;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var solutionRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = solutionRoot
});

builder.Configuration
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
builder.Services.AddSingleton<ObservableOrderService>();
builder.Services.AddSingleton<PumpManager>();
builder.Services.AddSingleton<IOtpService, InMemoryOtpService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<GpioController>();

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
// If url is set in appsettings.json, it will be used instead
var url = builder.Configuration["Url"];
if (!string.IsNullOrWhiteSpace(url))
{
    app.Urls.Add(url);
}

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

app.UseWebSockets();
app
    .MapIngredientApis()
    .MapDrinkApis()
    .MapUserApi()
    .MapOrderApis();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    PumpSeeder.SeedPumps(db);
    UserSeeder.SeedUsers(db);
}

app.Run();