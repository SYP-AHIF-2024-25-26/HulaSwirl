using System.Collections.Concurrent;

namespace Backend.Apis.Users;

public class InMemoryOtpService : IOtpService
{
    public int ValidityMinutes => 10;

    private readonly ConcurrentDictionary<int, (string Code, DateTime Expiry)> _store = new();

    public string GenerateOtp(int userId)
    {
        var code = new Random().Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(ValidityMinutes);
        _store[userId] = (code, expiry);
        return code;
    }

    public bool ValidateOtp(int userId, string otp)
    {
        if (!_store.TryGetValue(userId, out var entry)) return false;
        if (entry.Expiry < DateTime.UtcNow) return false;
        return entry.Code == otp;
    }
}
