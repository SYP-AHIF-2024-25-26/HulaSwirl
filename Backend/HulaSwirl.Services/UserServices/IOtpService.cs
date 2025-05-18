namespace HulaSwirl.Services.UserServices;

public interface IOtpService
{
    int ValidityMinutes { get; }
    string GenerateOtp(string username);
    bool ValidateOtp(string username, string otp);
    bool UseOtp(string username, string otp);
}