using System.Collections.Concurrent;

namespace HulaSwirl.Services.UserServices;

public class InMemoryOtpService : IOtpService
{
    public int ValidityMinutes => 5;

    private readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> _store = new();

    public string GenerateOtp(string username)
    {
        var code = new Random().Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(ValidityMinutes);
        _store[username] = (code, expiry);
        return code;
    }

    public bool ValidateOtp(string username, string otp)
    {
        if (!_store.TryGetValue(username, out var entry)) return false;
        if (entry.Expiry < DateTime.UtcNow) return false;
        return entry.Code == otp;
    }

    public bool UseOtp(string username, string otp)
    {
        if (!ValidateOtp(username, otp)) return false;
        _store.TryRemove(username, out _);
        return true;
    }
}
