using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.UserServices;
using Microsoft.Extensions.Configuration;

namespace HulaSwirl.Services.DataAccess;

public static class PumpSeeder
{
    public static void SeedPumps(AppDbContext db, IConfiguration config)
    {
        var pumpCount = config.GetValue<int>("HulaConfig:AvailablePumpCount");
        
        if (db.Pump.Any()) return;
        for (var i = 1; i <= pumpCount; i++)
        {
            db.Pump.Add(new Pump(i, true));
        }
        db.SaveChanges();
    }
}

public static class UserSeeder
{
    public static void SeedUsers(AppDbContext db, IConfiguration config)
    {
        var users = new []
        {
            new User("System", BCryptHasher.Hash(config.GetValue<string>("HulaConfig:SystemKey")!), "system", DateTime.Now, null)
        };
        foreach (var user in users)
        {
            if (db.User.Any(u => u.Username == user.Username)) continue;
            db.User.Add(user);
        }
        db.SaveChanges();
    }
}