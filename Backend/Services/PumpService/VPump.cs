using System;
using System.Device.Gpio;
using System.Device.Pwm.Drivers;

namespace Backend.Services.PumpService
{
    public class VPump : IDisposable
    {
        private const int Frequency = 20_000;
        private SoftwarePwmChannel _pwmChannel;
        private readonly GpioController _controller;
        private readonly int _in1;
        private readonly int _in2;
        private bool _isForward = true;
        private bool _isRunning = false;
        private bool _disposed = false;

        public VPump(int in1, int in2, GpioController controller)
        {
            _controller = controller;
            _in1 = in1;
            _in2 = in2;

            _controller.OpenPin(_in2, PinMode.Output);
            _controller.Write(_in2, PinValue.Low);

            _pwmChannel = new SoftwarePwmChannel(_in1, Frequency, 0);
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

            _controller.Write(_isForward ? _in2 : _in1, PinValue.Low);
        }

        public void Stop()
        {
            if (!_isRunning) return;

            _pwmChannel.Stop();
            _isRunning = false;

            _controller.Write(_in1, PinValue.Low);
            _controller.Write(_in2, PinValue.Low);
        }

        public void ChangeDirection()
        {
            if (_isRunning)
                Stop();

            _isForward = !_isForward;

            _pwmChannel.Dispose();

            _pwmChannel = new SoftwarePwmChannel(_isForward ? _in1 : _in2, Frequency, 0);

            _controller.Write(_isForward ? _in2 : _in1, PinValue.Low);
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                Stop();
                _pwmChannel.Dispose();
                _controller.Dispose();
                _disposed = true;
            }
        }
    }
}
