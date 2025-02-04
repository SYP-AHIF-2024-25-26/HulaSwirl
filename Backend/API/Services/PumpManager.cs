namespace API.Services;

public class PumpManager(ILogger<Drink> drinkLogger) {
    private VPump[]? _pumps = null;
    private readonly ILogger<Drink> _drinkLogger = drinkLogger;


    public async Task StartPump(int slot, int ml) {
        _drinkLogger?.LogInformation($"Starting pump for slot: {slot}, ml: {ml}");
        _pumps ??= [new VPump(17, 27), new VPump(23, 24)];

        if (slot > _pumps.Length) {
            return;
        }

        _drinkLogger.LogInformation("Starting pump {slot}.", slot);

        //testing show that at 20% a pump can output 13ml/s
        var timeInSec = ml / 13;
        var pump = _pumps[slot + 1];
        var cancellationTokenSource = new CancellationTokenSource();

        try {
            pump.Start();
            _drinkLogger.LogInformation("Pump {slot} started.", slot);

            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
        }
        catch (TaskCanceledException) {
            _drinkLogger.LogInformation($"Pump {slot} operation was canceled.");
        }
        finally {
            pump.Stop();
            _drinkLogger.LogInformation($"Pump {slot} stopped.");
        }
    }
}