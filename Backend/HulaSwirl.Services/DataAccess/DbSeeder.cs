using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.UserServices;

namespace HulaSwirl.Services.DataAccess;

public static class PumpSeeder
{
    private const int InstalledPumps = 2;
    public static void SeedPumps(AppDbContext db)
    {
        if (db.Pump.Any()) return;
        for (var i = 1; i <= InstalledPumps; i++)
        {
            db.Pump.Add(new Pump(i, true));
        }
        db.SaveChanges();
    }
}

public static class UserSeeder
{
    public static void SeedUsers(AppDbContext db)
    {
        var user = new User
        {
            Username = "HulaSwirl Admin",
            Email = "admin@hulaswirl.com",
            PasswordHash = BCryptHasher.Hash("admin"),
            Role = "Admin"
        };
        if (db.User.Any(u => u.Username == user.Username)) return;
        db.User.Add(user);
        db.SaveChanges();
    }
}