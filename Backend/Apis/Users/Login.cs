using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class Login
{
    public static async Task<IResult> HandleLogin(LoginDto dto, AppDbContext db, JwtService jwtService, BCryptHasher hasher)
    {
        var user = await db.User.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null || !hasher.Verify(user.PasswordHash, dto.Password))
            return Results.Unauthorized();

        var token = jwtService.GenerateToken(user);
        return Results.Ok(new { token });
    }
}