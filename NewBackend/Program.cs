using NewBackend.Apis.Drink;
using NewBackend.Apis.Ingredients;
using NewBackend.Services.PumpService;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

//services
builder.Services.AddSingleton<GpioController>();
builder.Services.AddSingleton<PumpManager>();

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