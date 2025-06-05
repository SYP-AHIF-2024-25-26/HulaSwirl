using System.Device.Gpio;
using HulaSwirl.Services.OrderService;
using Microsoft.Extensions.Logging;

namespace HulaSwirl.Services.Pumps;

public class PumpManager(ILogger<PumpManager> logger, GpioController gpioController)
{
    private List<VPump>? _pumps;
    public bool Running { get; private set; }
    
    public async Task RunOrderAsync(IEnumerable<(int slot, int ml)> jobs)
    {
        if (Running) throw new InvalidOperationException("Pumps are already running.");

        InitializePumps();
        Running = true;

        try
        {
            var tasks = jobs.Select(j =>
            {
                var pump = _pumps![j.slot - 1];
                return pump.RunAsync(j.ml);
            });
            await Task.WhenAll(tasks);
        }
        finally
        {
            Running = false;
        }
    }

    private void InitializePumps()
    {
        if (_pumps is not null) return;

        _pumps =
        [
            new VPump(0, 1, gpioController),
            new VPump(2, 3, gpioController)
        ];

        _pumps.ForEach(pump => pump.SetSpeed(20));
    }
}