using System.Device.Gpio;
using HulaSwirl.Services.OrderService;
using Microsoft.Extensions.Logging;

namespace HulaSwirl.Services.Pumps;

public class PumpManager(ILogger<PumpManager> logger, GpioController gpioController)
{
    private List<VPump>? _pumps;
    public bool Running { get; private set; }

    public async Task StartPump(int? slot, int ml)
    {
        if (Running) throw new InvalidOperationException("Pumps are already running");
        InitializePumps();

        if (_pumps is null || slot is null || slot > _pumps.Count) return;

        logger.LogInformation("Starting pump for slot: {slot}, ml: {ml}", slot, ml);

        var timeInSec = ml / OrderValidation.ML_PER_SECOND;
        var pump = _pumps[(int)slot - 1];
        var cancellationTokenSource = new CancellationTokenSource();

        try
        {
            Running = true;
            pump.Start();
            logger.LogInformation("Pump {slot} started.", slot);
            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
        }
        catch (TaskCanceledException)
        {
            logger.LogInformation("Pump {slot} operation was canceled.", slot);
        }
        finally
        {
            pump.Stop();
            Running = false;
            logger.LogInformation("Pump {slot} stopped.", slot);
        }
    }

    private void InitializePumps()
    {
        if (_pumps is not null) return;

        _pumps =
        [
            new VPump(17, 27, gpioController),
            new VPump(23, 24, gpioController)
        ];

        _pumps.ForEach(pump => pump.SetSpeed(20));
    }
}