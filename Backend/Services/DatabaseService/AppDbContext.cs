using Backend.Services.DatabaseService.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.DatabaseService;

public class AppDbContext : DbContext {
    public DbSet<Order> Order { get; set; }
    public DbSet<Drink> Drink { get; set; }
    public DbSet<Ingredient> Ingredient { get; set; }
    public DbSet<IngredientInBottle> IngredientInBottle { get; set; }
    public DbSet<Pump> Pump { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<Ingredient>()
            .HasKey(di => new { di.DrinkId, di.IngredientName });
        base.OnModelCreating(modelBuilder);
    }

    //DO NOT REMOVE
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {

    }
}