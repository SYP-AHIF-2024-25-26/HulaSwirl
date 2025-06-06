using System.Device.Gpio;
using System.Device.Pwm.Drivers;
using HulaSwirl.Services.OrderService;

namespace HulaSwirl.Services.Pumps;

using System.Device.Pwm;

public class VPump : IDisposable
{
    private const int Frequency = 150;
    private readonly SoftwarePwmChannel _pwm;
    private readonly GpioController _controller;
    private readonly int _in2Pin;
    private bool _disposed;
    private bool _isRunning;

    public VPump(int pwmPin, int in2Pin, GpioController controller)
    {
        _controller = controller;
        _in2Pin = in2Pin;

        _pwm = new SoftwarePwmChannel(pwmPin, Frequency, 0);
        _controller.OpenPin(in2Pin, PinMode.Output);
        _controller.Write(in2Pin, PinValue.Low);
    }

    public void SetSpeed(int percentage)
    {
        if (percentage is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(percentage), "0–100");

        _pwm.DutyCycle = percentage / 100.0;
    }
    
    public async Task RunAsync(int ml)
    {
        if(_isRunning) throw new InvalidOperationException("Pump is already running.");
        _isRunning = true;
        _pwm.Start();
        await Task.Delay(TimeSpan.FromSeconds(ml / OrderValidation.ML_PER_SECOND));
        _pwm.Stop();
        _isRunning = false;
    }

    public void Dispose()
    {
        if (_disposed) return;
        _pwm.Dispose();
        _controller.ClosePin(_in2Pin);
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}
