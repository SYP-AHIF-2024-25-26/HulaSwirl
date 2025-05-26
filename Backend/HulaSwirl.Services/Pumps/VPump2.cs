using System.Device.Gpio;

namespace HulaSwirl.Services.Pumps;

using System.Device.Pwm;

public class VPump2 : IDisposable
{
    private const int Frequency = 20_000;
    private readonly PwmChannel _pwm;
    private readonly GpioController _controller;
    private readonly int _in2Pin;
    private bool _disposed;
    private bool _isRunning;

    public VPump2(int pwmPin, int in2Pin, GpioController controller)
    {
        _controller = controller;
        _in2Pin = in2Pin;

        _pwm = PwmChannel.Create(0, pwmPin, Frequency, 0);
        _controller.OpenPin(in2Pin, PinMode.Output);
        _controller.Write(in2Pin, PinValue.Low);
    }

    public void SetSpeed(int percentage)
    {
        if (percentage is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(percentage), "0–100");

        _pwm.DutyCycle = percentage / 100.0;
    }

    public async Task StartSoftAsync(int target = 100)
    {
        if (!_isRunning)
        {
            _pwm.Start();
            _isRunning = true;
        }

        await RampToAsync(target);
    }

    public async Task StopSoftAsync()
    {
        if (_isRunning)
        {
            await RampToAsync(0);
            _pwm.Stop();
            _isRunning = false;
        }
    }
    
    private async Task RampToAsync(int targetPercentage, int step = 5, int delayMs = 50)
    {
        if (targetPercentage is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(targetPercentage), "0–100 erlaubt");

        var currentPercentage = (int)Math.Round(_pwm.DutyCycle * 100);
        var direction = Math.Sign(targetPercentage - currentPercentage);

        while (currentPercentage != targetPercentage)
        {
            currentPercentage += step * direction;

            if ((direction > 0 && currentPercentage > targetPercentage) ||
                (direction < 0 && currentPercentage < targetPercentage))
            {
                currentPercentage = targetPercentage;
            }

            _pwm.DutyCycle = currentPercentage / 100.0;
            await Task.Delay(delayMs);
        }
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
