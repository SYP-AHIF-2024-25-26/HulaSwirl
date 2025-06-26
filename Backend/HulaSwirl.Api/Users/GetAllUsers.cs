using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class GetAllUsers
{
    public static async Task<IResult> HandleGetAll(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin() && !http.IsSystem()) return Results.Forbid();

        var users = await db.User
            .Select(u => new UserInfoDto
            {
                Username = u.Username,
                Role = u.Role,
                CreatedAt = u.CreatedAt,
                LastLogin = u.LastLogin
            })
            .ToListAsync();

        return Results.Ok(users);
    }
}
