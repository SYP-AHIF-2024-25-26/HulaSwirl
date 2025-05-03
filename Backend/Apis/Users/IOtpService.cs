namespace Backend.Apis.Users;

public interface IOtpService
{
    int ValidityMinutes { get; }
    string GenerateOtp(int userId);
    bool ValidateOtp(int userId, string otp);
}