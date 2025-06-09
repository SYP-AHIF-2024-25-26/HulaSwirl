using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class Login
{
    public static async Task<IResult> HandleLogin(UserDto dto, AppDbContext db, JwtService jwtService)
    {
        if (!dto.TryValidate(out var errors)) return Results.BadRequest(errors);
        var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());
        if (user == null || !BCryptHasher.Verify(user.KeyHash, dto.Key)) return Results.BadRequest("Invalid login attempt");
        var token = jwtService.GenerateToken(user);
        return Results.Ok(new { user.Username, token });
    }
}