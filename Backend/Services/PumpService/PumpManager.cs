namespace Backend.Services.PumpService;

public class PumpManager(ILogger<PumpManager> logger, GpioController gpioController)
{
    private List<VPump>? _pumps;


    public async Task StartPump(int slot, int ml)
    {
        InitializePumps();

        if (_pumps is not null && slot > _pumps.Count)
            return;

        logger.LogInformation("Starting pump for slot: {slot}, ml: {ml}", slot, ml);

        //testing shows that at 20% a pump can output 13ml/s
        var timeInSec = ml / 13;
        var pump = _pumps![slot];
        var cancellationTokenSource = new CancellationTokenSource();

        //forward pumping
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
            logger.LogInformation("Pump {slot} stopped.", slot);
        }

        //reverse pumping
        try
        {
            pump.ChangeDirection();
            pump.Start();
            logger.LogInformation("Pump {slot} started in reverse.", slot);

            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
        }
        catch (TaskCanceledException)
        {
            logger.LogInformation("Pump {slot} operation was canceled.", slot);
        }
        finally
        {
            pump.Stop();
            pump.ChangeDirection();
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