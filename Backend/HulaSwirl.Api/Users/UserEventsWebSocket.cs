using System.Net.WebSockets;
using HulaSwirl.Services.UserServices;

namespace HulaSwirl.Api.Users;

public static class UserEventsWebSocket
{
    public static async Task Handle(HttpContext httpContext, ObservableUserService service, JwtService jwtService)
    {
        if (!httpContext.WebSockets.IsWebSocketRequest)
        {
            httpContext.Response.StatusCode = 400;
            return;
        }

        var token = httpContext.Request.Query["token"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(token))
        {
            httpContext.Response.StatusCode = 400;
            return;
        }

        try
        {
            var username = jwtService.GetUsernameFromToken($"Bearer {token}");
            var socket = await httpContext.WebSockets.AcceptWebSocketAsync();
            var observer = new UserWebSocketObserver(socket);
            var subscription = service.Subscribe(username.ToLower(), observer);

            var buffer = new byte[1024 * 4];
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                    break;
            }
            subscription.Dispose();
        }
        catch
        {
            httpContext.Response.StatusCode = 401;
        }
    }
}
