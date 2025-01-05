
using TestingGPIOWebApp;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var pump = new Pump(17, 27);

app.MapGet("/", () =>
    "server on"
);

app.MapGet("/start", () => {
    pump.SetSpeed(20);
    pump.Start();
});

app.MapGet("/stop", () => {
    pump.SetSpeed(20);
    pump.Start();
});

app.Run();