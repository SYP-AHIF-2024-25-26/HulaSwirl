using HulaSwirl.Services.DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace HulaSwirl.Services.DataAccess;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Order { get; set; }
    public DbSet<Drink> Drink { get; set; }
    public DbSet<Ingredient> Ingredient { get; set; }
    public DbSet<DrinkIngredient> DrinkIngredient { get; set; }
    public DbSet<Pump> Pump { get; set; }
    public DbSet<User> User { get; set; }
    public DbSet<UserDrinkStatistic> UserDrinkStat { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserDrinkStatistic>()
            .HasKey(uds => new { uds.UserName, uds.DrinkId });

        modelBuilder.Entity<UserDrinkStatistic>()
            .HasOne(uds => uds.User)
            .WithMany(u => u.DrinkStatistics)
            .HasForeignKey(uds => uds.UserName);

        modelBuilder.Entity<UserDrinkStatistic>()
            .HasOne(uds => uds.Drink)
            .WithMany()
            .HasForeignKey(uds => uds.DrinkId);
    }
}

public class ApplicationDataContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlite(configuration.GetConnectionString("DefaultConnection"));

        return new AppDbContext(optionsBuilder.Options);
    }
}