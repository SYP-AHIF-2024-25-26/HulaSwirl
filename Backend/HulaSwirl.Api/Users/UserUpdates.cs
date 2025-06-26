using System.Net.WebSockets;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.UserServices;

namespace HulaSwirl.Api.Users;

public static class UserUpdates
{
    public static async Task HandleUserUpdates(
        HttpContext context,
        ObservableUserService userObservable,
        JwtService jwtService,
        AppDbContext db)
    {
        if (!context.WebSockets.IsWebSocketRequest)
        {
            context.Response.StatusCode = 400;
            return;
        }

        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            context.Response.StatusCode = 401;
            return;
        }

        string username;
        try
        {
            username = jwtService.GetUsernameFromToken(authHeader);
        }
        catch
        {
            context.Response.StatusCode = 401;
            return;
        }

        var user = await db.User.FindAsync(username);
        if (user is null)
        {
            context.Response.StatusCode = 401;
            return;
        }

        var socket = await context.WebSockets.AcceptWebSocketAsync();
        var observer = new UserWebSocketObserver(socket);
        var subscription = userObservable.Subscribe(observer);

        var buffer = new byte[1024 * 4];
        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close)
                break;
        }
        subscription.Dispose();
    }
}
