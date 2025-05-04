namespace Backend.Apis.Users;

public record CreateUserDto
{
    [Required]
    public string Username { get; init; } = null!;

    [Required, EmailAddress]
    public string Email { get; init; } = null!;

    [Required]
    public string Password { get; init; } = null!;
}

public record LoginDto
{
    [Required, EmailAddress]
    public string Email { get; init; } = null!;

    [Required]
    public string Password { get; init; } = null!;
}

public record ResetPasswordDto
{
    [Required]
    public string Otp { get; init; } = null!;

    [Required]
    public string NewPassword { get; init; } = null!;
}

public record DeleteUserDto
{
    [Required]
    public string Otp { get; init; } = null!;
}