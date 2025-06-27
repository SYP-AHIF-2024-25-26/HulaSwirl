using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HulaSwirl.Services.UserServices;

public class UserEvent
{
    public string EventType { get; set; } = string.Empty; // "deleted" or "role-changed"
    public string? Role { get; set; }
}

public class ObservableUserService
{
    private readonly Dictionary<string, List<IObserver<UserEvent>>> _observers = new();

    public IDisposable Subscribe(string username, IObserver<UserEvent> observer)
    {
        if (!_observers.TryGetValue(username.ToLower(), out var list))
        {
            list = [];
            _observers[username.ToLower()] = list;
        }
        if (!list.Contains(observer))
            list.Add(observer);
        return new Unsubscriber(list, observer);
    }

    public async Task BroadcastAsync(string username, UserEvent evt)
    {
        if (_observers.TryGetValue(username.ToLower(), out var list))
        {
            foreach (var observer in list.ToArray())
            {
                observer.OnNext(evt);
            }
        }
        await Task.CompletedTask;
    }

    private class Unsubscriber : IDisposable
    {
        private readonly List<IObserver<UserEvent>> _list;
        private readonly IObserver<UserEvent> _observer;

        public Unsubscriber(List<IObserver<UserEvent>> list, IObserver<UserEvent> observer)
        {
            _list = list;
            _observer = observer;
        }

        public void Dispose()
        {
            if (_list.Contains(_observer))
                _list.Remove(_observer);
        }
    }
}
