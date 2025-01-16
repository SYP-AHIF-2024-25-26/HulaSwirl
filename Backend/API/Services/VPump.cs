using System.Device.Gpio;
using System.Device.Pwm;
using System.Device.Pwm.Drivers;

public class VPump
{
    private readonly PwmChannel _pwmForward;
    private readonly PwmChannel _pwmReverse;
    private readonly GpioController _controller;
    private readonly int _in1;
    private readonly int _in2;

    public VPump(int in1, int in2, int frequency = 20000)
    {
        _in1 = in1;
        _in2 = in2;
        _controller = GpioManager.Instance.Controller;

        _pwmForward = new SoftwarePwmChannel(
            in1, frequency: frequency, dutyCycle: 0.0);

        _pwmReverse = new SoftwarePwmChannel(
            in2, frequency: frequency, dutyCycle: 0.0);

        _controller.OpenPin(_in1, PinMode.Output);
        _controller.OpenPin(_in2, PinMode.Output);

        Stop();
    }

    public void Forward(int speedPercent)
    {
        if (speedPercent is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(speedPercent));

        _pwmReverse.Stop();
        _controller.Write(_in2, PinValue.Low);

        _pwmForward.DutyCycle = speedPercent / 100.0;
        _pwmForward.Start();
    }

    public void Reverse(int speedPercent)
    {
        if (speedPercent < 0 || speedPercent > 100)
            throw new ArgumentOutOfRangeException(nameof(speedPercent));

        _pwmForward.Stop();
        _controller.Write(_in1, PinValue.Low);

        _pwmReverse.DutyCycle = speedPercent / 100.0;
        _pwmReverse.Start();
    }

    public void Stop()
    {
        _pwmForward.Stop();
        _pwmReverse.Stop();

        _controller.Write(_in1, PinValue.Low);
        _controller.Write(_in2, PinValue.Low);
    }
}
