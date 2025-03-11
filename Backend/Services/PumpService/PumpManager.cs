using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Device.Gpio;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Services.PumpService
{
    public class PumpManager
    {
        private readonly ILogger<PumpManager> _logger;
        private readonly GpioController _gpioController;
        private List<VPump>? _pumps;

        public PumpManager(ILogger<PumpManager> logger, GpioController gpioController)
        {
            _logger = logger;
            _gpioController = gpioController;
        }

        public async Task StartPump(int? slot, int ml)
        {
            InitializePumps();

            if (_pumps is null || slot is null || slot >= _pumps.Count)
                return;

            _logger.LogInformation("Starting pump for slot: {slot}, ml: {ml}", slot, ml);

            var timeInSec = ml / 13;
            var pump = _pumps[(int)slot];
            var cancellationTokenSource = new CancellationTokenSource();

            try
            {
                pump.Start();
                _logger.LogInformation("Pump {slot} started.", slot);
                await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
            }
            catch (TaskCanceledException)
            {
                _logger.LogInformation("Pump {slot} operation was canceled.", slot);
            }
            finally
            {
                pump.Stop();
                _logger.LogInformation("Pump {slot} stopped.", slot);
            }

            await ReversePump((int)slot, ml);
        }

        private void InitializePumps()
        {
            if (_pumps is not null) return;

            _pumps = new List<VPump>
            {
                new VPump(17, 27, _gpioController), // Pump 1 (forward)
                new VPump(23, 24, _gpioController)  // Pump 2 (forward)
            };

            _pumps.ForEach(pump => pump.SetSpeed(20));
        }

        private async Task ReversePump(int slot, int ml)
        {
            _logger.LogInformation("Reversing pump {slot} direction.", slot);

            _pumps[slot].Dispose();
            _logger.LogInformation("Disposed pump {slot}. Reinitializing in reverse.", slot);

            int newPwmPin, newFixedPin;
            switch (slot)
            {
                case 0:
                    newPwmPin = 27;
                    newFixedPin = 17;
                    break;
                case 1:
                    newPwmPin = 24;
                    newFixedPin = 23;
                    break;
                default:
                    return;
            }

            _pumps[slot] = new VPump(newPwmPin, newFixedPin, _gpioController);
            _pumps[slot].SetSpeed(20);
            _logger.LogInformation("Pump {slot} reinitialized in reverse.", slot);

            var timeInSec = ml / 13;
            var cancellationTokenSource = new CancellationTokenSource();

            try
            {
                _pumps[slot].Start();
                _logger.LogInformation("Pump {slot} started in reverse.", slot);
                await Task.Delay(TimeSpan.FromSeconds(timeInSec), cancellationTokenSource.Token);
            }
            catch (TaskCanceledException)
            {
                _logger.LogInformation("Pump {slot} operation was canceled.", slot);
            }
            finally
            {
                _pumps[slot].Stop();
                _logger.LogInformation("Pump {slot} stopped.", slot);
            }
        }
    }
}
