using Microsoft.EntityFrameworkCore;

namespace Backend.Services.DatabaseService;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Order { get; set; }
    public DbSet<Drink> Drink { get; set; }
    public DbSet<Ingredient> Ingredient { get; set; }
    public DbSet<IngredientInBottle> IngredientInBottle { get; set; }
    public DbSet<Pump> Pump { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    }
}