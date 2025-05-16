using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.Dtos;

public record CreateUserDto
{
    public required string Username { get; init; } = null!;

    [EmailAddress]
    public required string Email { get; init; } = null!;

    public required string Password { get; init; } = null!;
}

public record LoginDto
{
    [EmailAddress]
    public required string Email { get; init; } = null!;

    public string Password { get; init; } = null!;
}

public record ResetPasswordDto
{
    public required string Otp { get; init; } = null!;

    public required string NewPassword { get; init; } = null!;
}

public record DeleteUserDto
{
    public required string Otp { get; init; } = null!;
}