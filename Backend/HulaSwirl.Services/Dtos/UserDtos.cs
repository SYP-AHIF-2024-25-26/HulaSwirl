using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.Dtos;

public record UserDto
{
    public required string Username { get; init; } = null!;

    public required string Key { get; init; } = null!;
}

public record UserInfoDto
{
    public required string Username { get; init; } = null!;
    public required string Role { get; init; } = null!;
    
    public required DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    
    public required DateTime? LastLogin { get; init; } = DateTime.UtcNow;
}

public record ResetUserKeyDto
{
    public required string NewKey { get; init; }
}