using System.Device.Gpio;
using System.IdentityModel.Tokens.Jwt;
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
using System.Security.Claims;

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
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
builder.Services.AddSingleton<ObservableOrderService>();
builder.Services.AddSingleton<ObservableUserService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<PumpManager>();
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
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true
        };
        
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var username = context.Principal?.Claims
                    .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(username))
                {
                    context.Fail("Invalid token");
                    return;
                }
                var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
                if (user == null)
                {
                    context.Fail("User deleted");
                    return;
                }
                var identity = context.Principal!.Identity as ClaimsIdentity;
                var roleClaim = identity!.FindFirst(ClaimTypes.Role);
                if (roleClaim != null)
                    identity.RemoveClaim(roleClaim);
                identity.AddClaim(new Claim(ClaimTypes.Role, user.Role));
            }
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

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
    PumpSeeder.SeedPumps(db, builder.Configuration);
    UserSeeder.SeedUsers(db, builder.Configuration);
}

app.Run();