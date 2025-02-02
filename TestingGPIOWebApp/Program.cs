
using TestingGPIOWebApp;

var builder = WebApplication.CreateBuilder(args);


var app = builder.Build();

app.Urls.Add("http://192.168.178.62:5000");


Pump[] pumps = [new Pump(17, 27), new Pump(23, 24)];

pumps[0].SetSpeed(20);
pumps[1].SetSpeed(20);


app.MapGet("/", () =>
    "server on"
);

app.MapGet("/start", (int id) => {
	pumps[id].Start();
});

app.MapGet("/stop", (int id) => {
    pumps[id].Stop();
});

app.Run();
