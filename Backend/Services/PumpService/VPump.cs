using System;
using System.Device.Gpio;
using System.Device.Pwm.Drivers;

namespace Backend.Services.PumpService
{
    public class VPump : IDisposable
    {
        private const int Frequency = 20_000;
        private readonly SoftwarePwmChannel _pwmChannel;
        private readonly GpioController _controller;
        private readonly int _pwmPin;
        private readonly int _fixedPin;
        private bool _isRunning = false;
        private bool _disposed = false;

        public VPump(int pwmPin, int fixedPin, GpioController controller)
        {
            _controller = controller;
            _pwmPin = pwmPin;
            _fixedPin = fixedPin;

            _controller.OpenPin(_fixedPin, PinMode.Output);
            _controller.Write(_fixedPin, PinValue.Low);

            _pwmChannel = new SoftwarePwmChannel(_pwmPin, Frequency, 0);
        }

        public void SetSpeed(int percentage)
        {
            if (percentage < 0 || percentage > 100)
                throw new ArgumentOutOfRangeException(nameof(percentage), "Percentage must be between 0 and 100");

            _pwmChannel.DutyCycle = Math.Round(percentage / 100.0, 2);
        }

        public void Start()
        {
            if (_isRunning) return;

            _pwmChannel.Start();
            _isRunning = true;

            _controller.Write(_fixedPin, PinValue.Low);
        }

        public void Stop()
        {
            if (!_isRunning) return;

            _pwmChannel.Stop();
            _isRunning = false;

            _controller.Write(_pwmPin, PinValue.Low);
            _controller.Write(_fixedPin, PinValue.Low);
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                Stop();
                _pwmChannel.Dispose();
                _controller.ClosePin(_fixedPin);
                _disposed = true;
            }
        }
    }
}