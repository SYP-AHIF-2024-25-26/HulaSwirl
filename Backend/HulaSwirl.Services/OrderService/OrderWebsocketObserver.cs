using HulaSwirl.Services.DataAccess.Models;

namespace HulaSwirl.Services.OrderService;

using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class OrdersWebSocketObserver(WebSocket webSocket) : IObserver<List<Order>>
{
    public void OnCompleted() { }
    public void OnError(Exception error) { }

    public void OnNext(List<Order> orders)
    {
        if (webSocket.State != WebSocketState.Open) return;
        var json = JsonSerializer.Serialize(orders, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var buffer = Encoding.UTF8.GetBytes(json);
        webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None).GetAwaiter().GetResult();
    }
}
