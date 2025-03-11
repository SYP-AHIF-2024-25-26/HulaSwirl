using System;
using System.Device.Gpio;
using System.Device.Pwm.Drivers;

namespace Backend.Services.PumpService
{
    public class VPump
    {
        private const int Frequency = 20_000;
        private readonly SoftwarePwmChannel _pwmChannel;

        public VPump(int in1, int in2, GpioController controller)
        {
            _pwmChannel = new SoftwarePwmChannel(in1, Frequency, 0);

            controller.OpenPin(in1, PinMode.Output);
            controller.OpenPin(in2, PinMode.Output);

            controller.Write(in2, PinValue.Low);
        }

        public void SetSpeed(int percentage)
        {
            if (percentage is < 0 or > 100)
                throw new ArgumentOutOfRangeException(nameof(percentage), "Percentage must be between 0 and 100");

            _pwmChannel.DutyCycle = Math.Round(percentage / 100.0, 2);
        }

        public void Start()
        {
            _pwmChannel.Start();
        }

        public void Stop()
        {
            _pwmChannel.Stop();
        }
    }
}