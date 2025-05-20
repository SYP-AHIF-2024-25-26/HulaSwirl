using HulaSwirl.Services.DataAccess.Models;

namespace HulaSwirl.Services.OrderService;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class ObservableOrderService : IObservable<List<Order>>
{
    private readonly List<IObserver<List<Order>>> _observers = [];

    public IDisposable Subscribe(IObserver<List<Order>> observer)
    {
        if (!_observers.Contains(observer))
            _observers.Add(observer);
        return new Unsubscriber(_observers, observer);
    }

    public async Task BroadcastAsync(List<Order> orders)
    {
        foreach (var observer in _observers.ToArray())
        {
            observer.OnNext(orders);
        }
        await Task.CompletedTask;
    }

    private class Unsubscriber : IDisposable
    {
        private readonly List<IObserver<List<Order>>> _observers;
        private readonly IObserver<List<Order>>? _observer;

        public Unsubscriber(List<IObserver<List<Order>>> observers, IObserver<List<Order>> observer)
        {
            _observers = observers;
            _observer = observer;
        }

        public void Dispose()
        {
            if (_observer != null && _observers.Contains(_observer))
                _observers.Remove(_observer);
        }
    }
}
