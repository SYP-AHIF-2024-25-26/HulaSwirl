namespace API.Services;

public class PumpManager(ILogger<Drink> drinkLogger, PumpManager pumpManager) {
    private readonly VPump[] _pumps = [new VPump(17, 27), new VPump(23, 24)];
    private readonly ILogger<Drink> _drinkLogger = drinkLogger;
    private readonly PumpManager _pumpManager = pumpManager;

    public async void StartPump(int slot, int ml) {
        if (slot > _pumps.Length) {
            return;
        }
        _drinkLogger.LogInformation("Starting pump {slot}.", slot);

        //testing show that at 20% a pump can output 13ml/s
        var timeInSec = ml / 13;
        var pump = _pumps[slot + 1];
        var cancellationTokenSource = new CancellationTokenSource();

        try {
            pump.Forward(20);
            _drinkLogger.LogInformation("Pump {slot} started.", slot);

            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);

            _drinkLogger.LogInformation($"Pump {slot} running reverse for {timeInSec:F2} seconds.");

            pump.Reverse(100);
            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
        } catch (TaskCanceledException) {
            _drinkLogger.LogInformation($"Pump {slot} operation was canceled.");
        } finally {
            pump.Stop();
            _drinkLogger.LogInformation($"Pump {slot} stopped.");
        }

    }
}