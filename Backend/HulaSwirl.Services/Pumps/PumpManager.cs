using System.Device.Gpio;
using Microsoft.Extensions.Configuration;

namespace HulaSwirl.Services.Pumps;

public class PumpManager(IConfiguration config, GpioController? controller)
{
    private readonly bool _virtualMode = controller is null;
    private List<VPump>? _pumps;
    public bool Running { get; private set; }

    public async Task RunOrderAsync(IEnumerable<(int slot, int ml)> jobs)
    {
        if (Running) throw new InvalidOperationException();
        var valueTuples = jobs.ToList();

        Running = true;
        try
        {
            if (!_virtualMode)
            {

                InitializePumps();

                var tasks = valueTuples.Select(j =>
                {
                    var pump = _pumps![j.slot - 1];
                    return pump.RunAsync(j.ml);
                });
                await Task.WhenAll(tasks);
            }
        }
        finally
        {
            Running = false;
        }
    }

    private void InitializePumps()
    {
        if (_virtualMode || _pumps is not null) return;

        var gpioController = controller ?? throw new InvalidOperationException("GPIO controller is not available.");

        _pumps =
        [
            new VPump(15, 14, gpioController, config), //10
            new VPump(23, 18, gpioController, config), //9
            new VPump(25, 24, gpioController, config), //8
            new VPump(16, 12, gpioController, config), //7
            new VPump(21, 20, gpioController, config), //6
            new VPump(11, 5, gpioController, config), //5
            new VPump(10, 9, gpioController, config), //4
            new VPump(27, 22, gpioController, config), //3
            new VPump(4, 17, gpioController, config), //2
            new VPump(6, 13, gpioController, config) //1
        ];

        _pumps.ForEach(pump => pump.SetSpeed(50));
    }
}