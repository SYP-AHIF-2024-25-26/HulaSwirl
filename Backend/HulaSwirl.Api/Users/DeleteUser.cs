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
        HttpContext http)
    {
        if (!http.IsAdmin() && !http.IsSystem()) return ErrorResults.Forbidden();
        var user = await db.User.FindAsync(username);
        if (user == null) return ErrorResults.NotFound("User not found.");

        if (user.Username == "system") return ErrorResults.Forbidden();

        db.User.Remove(user);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
