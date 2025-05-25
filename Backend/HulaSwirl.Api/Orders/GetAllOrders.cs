using System.Net.WebSockets;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class GetAllOrders
{
    public static async Task HandleGetAllOrders(HttpContext httpContext, ObservableOrderService orderObservable, AppDbContext context)
    {
        if (httpContext.WebSockets.IsWebSocketRequest)
        {
            var socket = await httpContext.WebSockets.AcceptWebSocketAsync();

            var observer = new OrdersWebSocketObserver(socket);
            var subscription = orderObservable.Subscribe(observer);

            var orders = context.Order.Include(o => o.DrinkIngredients).ToList();
            observer.OnNext(orders);

            var buffer = new byte[1024 * 4];
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                    break;
            }
            subscription.Dispose();
        }
        else
        {
            httpContext.Response.StatusCode = 400;
        }
    }
}