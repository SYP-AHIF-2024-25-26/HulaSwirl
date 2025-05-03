using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class CreateUser
{
    public static async Task<IResult> HandleCreate(CreateUserDto dto, AppDbContext db, BCryptHasher hasher)
    {
        if (await db.User.AnyAsync(u => u.Username == dto.Username))
            return Results.Conflict("Username already exists.");

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = hasher.Hash(dto.Password),
            Role = dto.Role
        };

        db.User.Add(user);
        await db.SaveChangesAsync();

        return Results.Created($"/api/users/{user.Id}", new { user.Id, user.Username });
    }
}