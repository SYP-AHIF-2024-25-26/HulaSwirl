using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HulaSwirl.Services.UserServices;

public class ObservableUserService : IObservable<UserUpdate>
{
    private readonly List<IObserver<UserUpdate>> _observers = [];

    public IDisposable Subscribe(IObserver<UserUpdate> observer)
    {
        if (!_observers.Contains(observer))
            _observers.Add(observer);
        return new Unsubscriber(_observers, observer);
    }

    public async Task BroadcastAsync(UserUpdate update)
    {
        foreach (var observer in _observers.ToArray())
        {
            observer.OnNext(update);
        }
        await Task.CompletedTask;
    }

    private class Unsubscriber : IDisposable
    {
        private readonly List<IObserver<UserUpdate>> _observers;
        private readonly IObserver<UserUpdate>? _observer;

        public Unsubscriber(List<IObserver<UserUpdate>> observers, IObserver<UserUpdate> observer)
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
