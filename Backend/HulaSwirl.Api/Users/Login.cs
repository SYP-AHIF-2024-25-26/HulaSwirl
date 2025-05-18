using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class Login
{
    public static async Task<IResult> HandleLogin(LoginDto dto, AppDbContext db, JwtService jwtService)
    {
        if (!dto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });
        var user = await db.User.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCryptHasher.Verify(user.PasswordHash, dto.Password))
            return Results.BadRequest("Invalid login attempt");

        var token = jwtService.GenerateToken(user);
        return Results.Ok(new { user.Username, token });
    }
}