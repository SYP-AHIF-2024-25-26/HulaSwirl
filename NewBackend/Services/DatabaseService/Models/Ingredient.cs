namespace NewBackend.Services.DatabaseService.Models;

public class Ingredient {
    [Key] [MaxLength(100)] public string Name { get; set; }

    public int RemainingMl { get; set; }

    public int MaxMl { get; set; }

    public virtual Pump? Pump { get; set; }

    public virtual ICollection<DrinkIngredient>? DrinkIngredients { get; set; } = new List<DrinkIngredient>();
}