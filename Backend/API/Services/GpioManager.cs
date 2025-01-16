namespace API.Services;

public sealed class GpioManager {
    private static readonly Lazy<GpioManager> Lazy = new(() => new GpioManager());

    private GpioManager() {
        Controller = new GpioController();
    }

    public static GpioManager Instance => Lazy.Value;
    public GpioController Controller { get; }
}