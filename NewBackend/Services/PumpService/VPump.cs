using System.Device.Gpio;
using System.Device.Pwm.Drivers;

namespace NewBackend.Services.PumpService;

public class VPump {
    private const int Frequency = 20_000;
    private readonly GpioController _controller;

    private readonly SoftwarePwmChannel _channel1;


    public VPump(int in1, int in2, GpioController controller) {
        _controller = controller;

        //create channels
        _channel1 = new SoftwarePwmChannel(in1, Frequency, 0);

        controller.OpenPin(in2, PinMode.Output);
        controller.Write(in2, PinValue.Low);

        //in1 -> PWM, in2 -> LOW ---> pump Forward
    }

    public void SetSpeed(int percentage) {
        if (percentage is < 0 or > 100) {
            throw new Exception("percentage format -> between 0 - 100");
        }

        _channel1.DutyCycle = Math.Round(percentage / 100.0, 2);
    }

    public void Start() {
        _channel1.Start();
    }

    public void Stop() {
        _channel1.Stop();
    }
}