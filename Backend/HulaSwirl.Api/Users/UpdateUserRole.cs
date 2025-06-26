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
        [FromBody] UpdateRoleDto dto,
        AppDbContext db,
        HttpContext http)
    {
        var isSystem = http.IsSystem();
        var isAdmin = http.IsAdmin();
        if (!isSystem && !isAdmin) return Results.Forbid();

        var user = await db.User.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return ErrorResults.NotFound("User not found.");
        if (user.Username == "system") return Results.Forbid();

        var allowedRoles = isSystem ? new[] { "user", "operator", "admin" } : new[] { "user", "operator" };
        if (!allowedRoles.Contains(dto.Role))
            return ErrorResults.BadRequest(new ErrorDto { Message = "Invalid role", Target = "role" });

        user.Role = dto.Role;
        db.User.Update(user);
        await db.SaveChangesAsync();
        return Results.Ok();
    }
}
