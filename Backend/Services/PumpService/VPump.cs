using System;
using System.Device.Gpio;
using System.Device.Pwm.Drivers;

namespace Backend.Services.PumpService
{
    public class VPump
    {
        private const int Frequency = 20_000;
        private readonly SoftwarePwmChannel _channel1;
        private readonly GpioController _controller;
        private readonly int _in2;
        private bool _isForward = true;

        public VPump(int in1, int in2, GpioController controller)
        {
            _controller = controller;
            _in2 = in2;

            // Create PWM channel
            _channel1 = new SoftwarePwmChannel(in1, Frequency, 0);

            // Setup in2 as an output pin
            _controller.OpenPin(_in2, PinMode.Output);
            _controller.Write(_in2, PinValue.Low); // Default to Forward
        }

        public void SetSpeed(int percentage)
        {
            if (percentage is < 0 or > 100)
                throw new ArgumentOutOfRangeException(nameof(percentage), "Percentage must be between 0 and 100");

            _channel1.DutyCycle = Math.Round(percentage / 100.0, 2);
        }

        public void Start()
        {
            _channel1.Start();
        }

        public void Stop()
        {
            _channel1.Stop();
        }

        public void ChangeDirection()
        {
            _isForward = !_isForward;
            _controller.Write(_in2, _isForward ? PinValue.Low : PinValue.High);
        }
    }
}