using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.Dtos;
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
    public static async Task<Result<User>> CreateUserAsync(AppDbContext context, CreateUserDto dto)
    {
        var errors = new List<string>();
        if (!dto.TryValidate(out var validationErrors))
            errors.AddRange(validationErrors);

        if (await context.User.AnyAsync(u => u.Email == dto.Email))
            errors.Add("Email already in use");

        if (await context.User.AnyAsync(u => u.Username == dto.Username))
            errors.Add("Username already exists.");

        if (errors.Count != 0)
            return Result<User>.Failure(errors);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCryptHasher.Hash(dto.Password),
            Role = "Admin"
        };

        context.User.Add(user);
        await context.SaveChangesAsync();

        return Result<User>.Success(user);
    }
}
