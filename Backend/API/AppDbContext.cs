using Pump = API.Model.Pump;

namespace API;

public class AppDbContext : DbContext {
    public DbSet<Order> Orders { get; set; }
    public DbSet<Drink> Drinks { get; set; }
    public DbSet<DrinkIngredient> DrinkIngredients { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<Pump> Pumps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<DrinkIngredient>()
            .HasKey(di => new { di.DrinkId, di.IngredientName });
        base.OnModelCreating(modelBuilder);
    }
}