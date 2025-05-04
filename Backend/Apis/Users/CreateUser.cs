using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class CreateUser
{
    public static async Task<IResult> HandleCreate(CreateUserDto dto, AppDbContext db, BCryptHasher hasher, [FromServices] JwtService jwtService)
    {
        if (!dto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });
        if(await db.User.AnyAsync(u => u.Email == dto.Email))
            return Results.Conflict("Email already in use");
        if (await db.User.AnyAsync(u => u.Username == dto.Username))
            return Results.Conflict("Username already exists.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = hasher.Hash(dto.Password),
            Role = "Admin"
        };

        db.User.Add(user);
        await db.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);
        return Results.Created($"/api/users/{user.Username}", new { user.Username, token });
    }
}