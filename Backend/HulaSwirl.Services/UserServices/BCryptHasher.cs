namespace HulaSwirl.Services.UserServices;

public static class BCryptHasher
{
    public static string Hash(string key) => BCrypt.Net.BCrypt.HashPassword(key);
    public static bool Verify(string hash, string key) => BCrypt.Net.BCrypt.Verify(key, hash);
}