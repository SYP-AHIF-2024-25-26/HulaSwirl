using Microsoft.EntityFrameworkCore;

namespace Backend.Services.DatabaseService;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<DrinkOrder> DrinkOrder { get; set; }
    public DbSet<Drink> Drink { get; set; }
    public DbSet<Ingredient> Ingredient { get; set; }
    public DbSet<DrinkIngredient> DrinkIngredient { get; set; }
    public DbSet<Pump> Pump { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    }
}