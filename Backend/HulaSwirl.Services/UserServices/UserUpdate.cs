namespace HulaSwirl.Services.UserServices;

public class UserUpdate
{
    public required string Username { get; set; }
    public required string Type { get; set; } // "deleted" or "role"
    public string? Role { get; set; }
}
