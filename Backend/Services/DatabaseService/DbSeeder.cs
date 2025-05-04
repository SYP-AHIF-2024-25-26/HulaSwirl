using Backend.Apis.Users;

namespace Backend.Services.DatabaseService;

public static class PumpSeeder
{
    private const int INSTALLED_PUMPS = 2;
    public static void SeedPumps(AppDbContext db)
    {
        if (db.Pump.Any()) return;
        for (var i = 1; i <= INSTALLED_PUMPS; i++)
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
        var user = new User()
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