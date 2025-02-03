using Pump = API.Model.Pump;

namespace API;

public class AppDbContext : DbContext {
    public DbSet<Order> Order { get; set; }
    public DbSet<Drink> Drink { get; set; }
    public DbSet<DrinkIngredient> DrinkIngredient { get; set; }
    public DbSet<Ingredient> Ingredient { get; set; }
    public DbSet<Pump> Pump { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<DrinkIngredient>()
            .HasKey(di => new { di.DrinkId, di.IngredientName });
        base.OnModelCreating(modelBuilder);
    }

    //DO NOT REMOVE
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}