using System.Security.Cryptography;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class ResetPassword
{
    public static async Task<IResult> HandleReset(
        [FromRoute] string username,
        AppDbContext db,
        HttpContext http,
        JwtService jwtService)
    {
        var isAdmin = http.IsAdmin();
        var isSystem = http.IsSystem();
        if (!isAdmin) return ErrorResults.Forbidden();

        var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        if (user == null) return ErrorResults.NotFound("User not found");
        if (user.Role == "system") return ErrorResults.Forbidden("Cannot reset system user password");
        if (!isSystem && user.Role == "admin" && !http.IsSelf(jwtService, username))
            return ErrorResults.Forbidden("Cannot reset another admin unless you are a system user");

        var newKey = GenerateReadableSecret();
        user.KeyHash = BCryptHasher.Hash(newKey);

        db.User.Update(user);
        await db.SaveChangesAsync();

        return Results.Ok(new { newKey });
    }

    private static string GenerateReadableSecret()
    {
        var bytes = RandomNumberGenerator.GetBytes(12);
        return Convert.ToBase64String(bytes)
            .Replace("/", "8")
            .Replace("+", "9")
            .Replace("=", string.Empty)
            .Substring(0, 16);
    }
}
