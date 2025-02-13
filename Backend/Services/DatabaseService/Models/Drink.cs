namespace Backend.Services.DatabaseService.Models;

public class Drink
{
    [Key] public int Id { get; set; }

    [MaxLength(100)] public string Name { get; set; }

    public bool Enabled { get; set; }

    [MaxLength(1000)] public string? Img { get; set; }

    [MaxLength(255)] public string? Toppings { get; set; }

    public virtual ICollection<Ingredient> DrinkIngredients { get; set; } = new List<Ingredient>();
}