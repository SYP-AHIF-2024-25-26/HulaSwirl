using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Services.UserServices;

/// <summary>
/// Handles creation and basic operations on <see cref="User"/> entities, decoupled from HTTP concerns.
/// </summary>
public static class UserFactory
{
    /// <summary>
    /// Creates a new user after validating DTO and uniqueness constraints.
    /// </summary>
    public static async Task<IResult> CreateUserAsync(AppDbContext context, UserDto dto, JwtService jwtService)
    {
        var errors = new List<string>();
        if (!dto.TryValidate(out var validationErrors))
            errors.AddRange(validationErrors);

        if (await context.User.AnyAsync(u => u.Username == dto.Username))
            errors.Add("Username already exists.");

        if (errors.Count != 0) return Results.Conflict(errors);

        var user = new User
        {
            Username = dto.Username,
            KeyHash = BCryptHasher.Hash(dto.Key),
            Role = "user"
        };

        context.User.Add(user);
        await context.SaveChangesAsync();
        var token = jwtService.GenerateToken(user);

        return Results.Created($"/api/users", new {
            user.Username,
            token
        });
    }
}
