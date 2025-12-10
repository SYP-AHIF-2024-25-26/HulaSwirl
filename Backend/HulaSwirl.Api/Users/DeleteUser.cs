using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class DeleteUser
{
    public static async Task<IResult> HandleDelete(
        [FromRoute] string username,
        AppDbContext db,
        HttpContext http,
        JwtService jwtService,
        ObservableUserService userService)
    {
        var isSelf = http.IsSelf(jwtService, username);
        var isAdmin = http.IsAdmin();

        if (!isSelf && !isAdmin) return ErrorResults.Forbidden();
        var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

        if (user == null) return ErrorResults.NotFound("User not found.");
        if (user.Role == "system") return ErrorResults.Forbidden("Cannot delete system user");
        if (!isSelf && user.Role == "admin" && !http.IsSystem())
            return ErrorResults.Forbidden("Cannot delete admin user unless you are a system user");

        db.User.Remove(user);
        await db.SaveChangesAsync();
        await userService.BroadcastAsync(username, new UserEvent { EventType = "deleted" });
        return Results.NoContent();
    }
}
