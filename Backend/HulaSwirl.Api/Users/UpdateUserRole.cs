using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class UpdateUserRole
{
    public static async Task<IResult> HandleUpdate(
        [FromRoute] string username,
        [FromQuery] string role,
        AppDbContext db,
        HttpContext http,
        ObservableUserService userService)
    {
        var isSystem = http.IsSystem();
        var isAdmin = http.IsAdmin();
        if (!isAdmin) return Results.Forbid();
        if(string.IsNullOrWhiteSpace(role)) return ErrorResults.BadRequest(new ErrorDto { Message = "Role must be specified", Target = string.Empty });

        var user = await db.User.FirstOrDefaultAsync(u => u.Username == username);
        
        if (user == null) return ErrorResults.NotFound("User not found");
        if(http.IsSelf(username)) return ErrorResults.BadRequest(new ErrorDto { Message = "Cannot change your own role", Target = username });
        if (user.Role == "system") return ErrorResults.Forbidden("Cannot change system user role");
        if (!isSystem && user.Role == "admin") return ErrorResults.Forbidden("Cannot change admin role unless you are a system user");

        var allowedRoles = isSystem ? new[] { "user", "operator", "admin" } : new[] { "user", "operator" };
        if (!allowedRoles.Contains(role.ToLower())) return ErrorResults.BadRequest(new ErrorDto { Message = "Invalid role", Target = username });

        user.Role = role.ToLower();
        db.User.Update(user);
        await db.SaveChangesAsync();
        await userService.BroadcastAsync(username, new UserEvent { EventType = "role-changed", Role = user.Role });
        return Results.Ok();
    }
}
