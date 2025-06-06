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
        if (Running) throw new InvalidOperationException();
        var valueTuples = jobs.ToList();
        if (valueTuples.Count > 6) throw new ArgumentException("Cannot run more than 6 pumps at once.", nameof(jobs));

        InitializePumps();
        Running = true;

        try
        {
            var tasks = valueTuples.Select(j =>
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
            new VPump(5, 6, gpioController), //1
            new VPump(14, 15, gpioController), //2
            new VPump(18, 23, gpioController), //3
            new VPump(24, 25, gpioController), //4
            new VPump(8, 7, gpioController), //5
            new VPump(11, 0, gpioController), //6
            new VPump(10, 9, gpioController), //7
            new VPump(27, 22, gpioController), //8
            new VPump(4, 17, gpioController), //9
            new VPump(2, 3, gpioController) //10
        ];

        _pumps.ForEach(pump => pump.SetSpeed(50));
    }
}