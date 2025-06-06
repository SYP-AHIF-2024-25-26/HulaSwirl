using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.UserServices;

namespace HulaSwirl.Services.DataAccess;

public static class PumpSeeder
{
    private const int InstalledPumps = 10;
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
        var users = new []
        {
            new User("HulaSwirl Admin", "admin@hulaswirl.com", BCryptHasher.Hash("admin"), "admin"),
            new User("HulaSwirl Operator", "operator@hulaswirl.com", BCryptHasher.Hash("operator"), "operator")
        };
        foreach (var user in users)
        {
            if (db.User.Any(u => u.Username == user.Username)) continue;
            db.User.Add(user);
        }
        db.SaveChanges();
    }
}