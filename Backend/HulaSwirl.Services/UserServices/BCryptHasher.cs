namespace HulaSwirl.Services.UserServices;

public static class BCryptHasher
{
    public static string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);
    public static bool Verify(string hash, string password) => BCrypt.Net.BCrypt.Verify(password, hash);
}