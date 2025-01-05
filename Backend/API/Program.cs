using API.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pomelo.EntityFrameworkCore.MySql;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
var connectionString = Env.GetString("DB_CONNECTION_STRING");
builder.Services.AddDbContext<AppDbContext>(options => options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 29))));
builder.Services.AddControllers();
var app = builder.Build();
app.MapControllers();
app.Run();

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