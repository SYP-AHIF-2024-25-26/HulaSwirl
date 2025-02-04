namespace API.Services;

public class PumpManager {
    private static readonly Lazy<PumpManager> Lazy = new(() => new PumpManager());
    private readonly VPump[] _pumps;

    private PumpManager() {
        _pumps = [new VPump(17, 27), new VPump(23, 24)];
    }
    
    public static PumpManager Instance => Lazy.Value;


    public async void StartPump(int slot, int ml) {
        Console.WriteLine($"Starting pump {slot}: {ml}");
        if (slot > _pumps.Length) {
            return;
        }

        //testing show that at 20% a pump can output 13ml/s
        var timeInSec = ml / 13;
        var pump = _pumps[slot + 1];
        var cancellationTokenSource = new CancellationTokenSource();

        try {
            pump.Forward(20);
            Console.WriteLine($"Pump {slot} started for {timeInSec:F2} seconds.");

            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);

            Console.WriteLine($"Pump {slot} running reverse for {timeInSec:F2} seconds.");

            pump.Reverse(100);
            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
        } catch (TaskCanceledException) {
            Console.WriteLine($"Pump {slot} operation was canceled.");
        } finally {
            pump.Stop();
            Console.WriteLine($"Pump {slot} stopped.");
        }

    }
}