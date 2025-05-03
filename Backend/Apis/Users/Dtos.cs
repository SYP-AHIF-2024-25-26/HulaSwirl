namespace Backend.Apis.Users;

public record CreateUserDto(string Username, string Password, string Role);

public record ResetPasswordDto(string Otp, string NewPassword);

public record LoginDto(string Username, string Password);