namespace TestingGPIOWebApp;

public sealed class GpioManager {
    private static readonly Lazy<GpioManager> _instance =
        new Lazy<GpioManager>(() => new GpioManager());

    private GpioManager() {
        Controller = new GpioController();
    }

    public static GpioManager Instance => _instance.Value;

    public GpioController Controller { get; }
}