namespace Backend.Services.PumpService;

public class PumpManager(ILogger<PumpManager> logger, GpioController gpioController)
{
    private List<VPump>? _pumps;
    private bool _isRunning;
    private readonly Lock _pumpLock = new();

    public async Task StartPump(int? slot, int ml)
    {
        // TODO: check if it is really necessary to init pumps every time this methode is called instead of initializing it once
        InitializePumps();

        lock (_pumpLock)
        {
            if (_pumps is null || slot is null || slot > _pumps.Count || _isRunning)
                return;
            
            _isRunning = true;
        }

        logger.LogInformation("Starting pump for slot: {slot}, ml: {ml}", slot, ml);

        // Testing shows that at 20% a pump can output 13ml/s
        var timeInSec = ml / 13;
        var pump = _pumps[(int)slot];
        var cancellationTokenSource = new CancellationTokenSource();

        try
        {
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
            lock (_pumpLock)
            {
                _isRunning = false;
            }
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