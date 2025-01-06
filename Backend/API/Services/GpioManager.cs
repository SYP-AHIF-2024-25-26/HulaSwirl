using System.Device.Gpio;

namespace API.Services;

public sealed class GpioManager {
    private static readonly Lazy<GpioManager> _lazy = new(() => new GpioManager());

    private GpioManager() {
        Controller = new GpioController();
    }

    public static GpioManager Instance => _lazy.Value;
    public GpioController Controller { get; }
}