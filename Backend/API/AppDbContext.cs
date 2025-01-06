using API.Model;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Drink> Drinks { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<DrinkIngredient> DrinkIngredients { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Drink>().HasKey(d => d.Id);
        modelBuilder.Entity<Ingredient>().HasKey(i => i.Name);
        modelBuilder.Entity<Drink>().Ignore("Ingredients");
        modelBuilder.Entity<DrinkIngredient>().HasNoKey();
        modelBuilder.Entity<Ingredient>().Property(i => i.RemainingMl).HasColumnName("remaining_liquid");
    }
}