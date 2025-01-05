
using TestingGPIOWebApp;

var builder = WebApplication.CreateBuilder(args);


var app = builder.Build();

app.Urls.Add("http://192.168.178.62:5000");

var pump = new Pump(17, 27);
pump.SetSpeed(20);

app.MapGet("/", () =>
    "server on"
);

app.MapGet("/start", () => {
    pump.Start();
});

app.MapGet("/stop", () => {
    pump.Stop();
});

app.Run();