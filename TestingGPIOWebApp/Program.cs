
using TestingGPIOWebApp;

var builder = WebApplication.CreateBuilder(args);


var app = builder.Build();

app.Urls.Add("http://192.168.178.62:5000");

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