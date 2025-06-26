using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace HulaSwirl.Services.UserServices;

public class UserWebSocketObserver(WebSocket webSocket) : IObserver<UserEvent>
{
    public void OnCompleted() { }
    public void OnError(Exception error) { }

    public void OnNext(UserEvent value)
    {
        if (webSocket.State != WebSocketState.Open) return;
        var json = JsonSerializer.Serialize(value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var buffer = Encoding.UTF8.GetBytes(json);
        webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None).GetAwaiter().GetResult();
    }
}
