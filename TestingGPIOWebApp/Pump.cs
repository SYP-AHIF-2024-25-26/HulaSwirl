namespace TestingGPIOWebApp;

public class Pump {
    private SoftwarePwmChannel _channel1;

    public Pump(int in1, int in2) {
        _channel1 = new SoftwarePwmChannel(in1, 20_000, 0);

        var manager = GpioManager.Instance.Controller;
        manager.OpenPin(in2, PinMode.Output);
        manager.Write(in2, PinValue.Low);
        //in1 -> PWM, in2 -> LOW ---> pump Forward
    }

    public void SetSpeed(int percentage) {
        if (percentage is > 0 and < 100) {
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