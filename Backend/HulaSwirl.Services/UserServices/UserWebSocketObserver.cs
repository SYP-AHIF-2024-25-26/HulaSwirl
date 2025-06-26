using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HulaSwirl.Services.UserServices;

public class UserWebSocketObserver(WebSocket webSocket) : IObserver<UserUpdate>
{
    public void OnCompleted() { }
    public void OnError(Exception error) { }

    public void OnNext(UserUpdate update)
    {
        if (webSocket.State != WebSocketState.Open) return;
        var json = JsonSerializer.Serialize(update, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var buffer = Encoding.UTF8.GetBytes(json);
        webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None).GetAwaiter().GetResult();
    }
}
