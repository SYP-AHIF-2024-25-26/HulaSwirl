using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class Login
{
    public static async Task<IResult> HandleLogin(LoginDto dto, AppDbContext db, JwtService jwtService, BCryptHasher hasher)
    {
        if (!dto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });
        var user = await db.User.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !hasher.Verify(user.PasswordHash, dto.Password))
            return Results.BadRequest("Invalid login attempt");

        var token = jwtService.GenerateToken(user);
        return Results.Ok(new { user.Username, token });
    }
}