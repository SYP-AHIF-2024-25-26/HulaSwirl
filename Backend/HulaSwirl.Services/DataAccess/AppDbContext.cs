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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Drink>()
            .HasMany(d => d.DrinkIngredients)
            .WithOne()
            .HasForeignKey(di => di.DrinkIdFk)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>().OwnsMany(o => o.OrderIngredients, a => a.ToJson());
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