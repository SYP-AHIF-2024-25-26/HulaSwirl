using System;
using System.Device.Gpio;
using System.Device.Pwm.Drivers;

namespace Backend.Services.PumpService
{
    public class VPump
    {
        private const int Frequency = 20_000;
        private readonly SoftwarePwmChannel _pwmChannel1;
        private readonly SoftwarePwmChannel _pwmChannel2;
        private readonly GpioController _controller;
        private readonly int _in1;
        private readonly int _in2;
        private bool _isForward = true;

        public VPump(int in1, int in2, GpioController controller)
        {
            _controller = controller;
            _in1 = in1;
            _in2 = in2;

            // Create PWM channels for both pins
            _pwmChannel1 = new SoftwarePwmChannel(_in1, Frequency, 0);
            _pwmChannel2 = new SoftwarePwmChannel(_in2, Frequency, 0);

            // Ensure both pins are set as outputs
            _controller.OpenPin(_in1, PinMode.Output);
            _controller.OpenPin(_in2, PinMode.Output);

            // Default direction: Forward (in1 -> PWM, in2 -> LOW)
            _controller.Write(_in2, PinValue.Low);
        }

        public void SetSpeed(int percentage)
        {
            if (percentage is < 0 or > 100)
                throw new ArgumentOutOfRangeException(nameof(percentage), "Percentage must be between 0 and 100");

            double dutyCycle = Math.Round(percentage / 100.0, 2);

            if (_isForward)
            {
                _pwmChannel1.DutyCycle = dutyCycle;
                _pwmChannel2.DutyCycle = 0;
            }
            else
            {
                _pwmChannel1.DutyCycle = 0;
                _pwmChannel2.DutyCycle = dutyCycle;
            }
        }

        public void Start()
        {
            _pwmChannel1.Start();
            _pwmChannel2.Start();
        }

        public void Stop()
        {
            _pwmChannel1.Stop();
            _pwmChannel2.Stop();
        }

        public void ChangeDirection()
        {
            _isForward = !_isForward;

            if (_isForward)
            {
                _pwmChannel1.Start();
                _pwmChannel2.Stop();
                _controller.Write(_in2, PinValue.Low);
            }
            else
            {
                _pwmChannel1.Stop();
                _pwmChannel2.Start();
                _controller.Write(_in1, PinValue.Low);
            }
        }
    }
}
