using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class ResetUserKey
{
    public static async Task<IResult> HandleReset(
        [FromRoute] string username,
        ResetUserKeyDto dto,
        AppDbContext db,
        HttpContext http,
        JwtService jwtService)
    {
        if (!http.IsAdmin()) return ErrorResults.Forbidden();

        if (string.IsNullOrWhiteSpace(dto.NewKey))
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = "A new key is required",
                Target = "newKey"
            });

        var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        if (user == null) return ErrorResults.NotFound("User not found.");
        if (user.Role == "system") return ErrorResults.Forbidden("Cannot reset system user");
        if (user.Role == "admin" && !http.IsSystem())
            return ErrorResults.Forbidden("Only the system user can reset another admin");

        user.KeyHash = BCryptHasher.Hash(dto.NewKey);
        db.User.Update(user);
        await db.SaveChangesAsync();

        if (http.IsSelf(jwtService, username))
        {
          // Ensure the requester cannot keep using an outdated token
          var token = jwtService.GenerateToken(user);
          return Results.Ok(token);
        }

        return Results.NoContent();
    }
}
