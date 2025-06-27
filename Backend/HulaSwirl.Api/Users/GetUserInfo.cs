using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class GetUserInfo
{
    // Get user info via JWT token
    public static async Task<IResult> HandleGetUserInfo(
        AppDbContext db,
        JwtService jwtService,
        HttpContext http)
    {
        var authHeader = http.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
            return Results.Unauthorized();
        try
        {
            var username = jwtService.GetUsernameFromToken(authHeader);
            var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
            if (user == null) return ErrorResults.NotFound("User not found.");

            var userDto = new UserInfoDto
            {
                Username = user.Username,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin
            };

            return Results.Ok(userDto);
        }
        catch
        {
            return Results.Unauthorized();
        }
    }
}