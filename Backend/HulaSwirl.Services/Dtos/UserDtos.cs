using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.Dtos;

public record UserDto
{
    public required string Username { get; init; } = null!;

    public required string Key { get; init; } = null!;
}