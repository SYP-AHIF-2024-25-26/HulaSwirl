using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;

namespace HulaSwirl.Api.Users;

public static class DeleteUser
{
    public static async Task<IResult> HandleDelete(
        [FromRoute] string username,
        AppDbContext db,
        ObservableUserService userObservable,
        HttpContext http)
    {
        if (!http.IsAdmin()) return ErrorResults.Forbidden();
        var user = await db.User.FindAsync(username);
        
        if (user == null) return ErrorResults.NotFound("User not found.");
        if (http.IsSelf(username)) return ErrorResults.BadRequest(new ErrorDto { Message = "Cannot delete your own account", Target = username });
        if(user.Role == "system") return ErrorResults.Forbidden("Cannot delete system user");
        if (!http.IsSystem() && user.Role == "admin") return ErrorResults.Forbidden("Cannot delete admin user unless you are a system user");
        
        db.User.Remove(user);
        await db.SaveChangesAsync();
        await userObservable.BroadcastAsync(new UserUpdate { Username = username, Type = "deleted" });
        return Results.NoContent();
    }
}
