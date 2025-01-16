namespace API.Services;

public class PumpManager {
    private static readonly Lazy<PumpManager> _lazy = new(() => new PumpManager());
    private readonly VPump[] _pumps;

    private PumpManager() {
        _pumps = [new VPump(17, 27), new VPump(23, 24)];
        
        foreach (var pump in _pumps) {
            pump.SetSpeed(20);
        }
    }
    
    public static PumpManager Instance => _lazy.Value;


    public async void StartPump(int slot, int ml) {
        if (slot > _pumps.Length) {
            
        }
        
        //testing show that at 20% a pump can output 13ml/s
        var timeInSec = ml / 13;
        var pump = _pumps[slot];
        var cancellationTokenSource = new CancellationTokenSource();

        try {
            pump.Start();
            Console.WriteLine($"Pump {slot} started for {timeInSec:F2} seconds.");

            await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
        } catch (TaskCanceledException) {
            Console.WriteLine($"Pump {slot} operation was canceled.");
        } finally {
            pump.Stop();
            Console.WriteLine($"Pump {slot} stopped.");
        }
        
    }
}