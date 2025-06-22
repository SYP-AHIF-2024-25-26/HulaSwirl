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
        var errors = new List<ErrorDto>();

        if (string.IsNullOrWhiteSpace(dto.Username))
            errors.Add(new ErrorDto
            {
                Message = "A username is required",
                Target = "username"
            });

        if (string.IsNullOrWhiteSpace(dto.Key))
            errors.Add(new ErrorDto
            {
                Message = "A key is required",
                Target = "key"
            });

        if (await context.User.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
            errors.Add(new ErrorDto
            {
                Message = "A user with this username already exists",
                Target = "username"
            });

        if (errors.Count != 0) return ErrorResults.Conflict(errors.ToArray());

        var user = new User
        {
            Username = dto.Username,
            KeyHash = BCryptHasher.Hash(dto.Key),
            Role = "user",
            CreatedAt = DateTime.UtcNow,
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
