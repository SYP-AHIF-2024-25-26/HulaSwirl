namespace NewBackend.Services.DatabaseService.Models;

public class IngredientInBottle {
    [Key] [MaxLength(100)] public string Name { get; set; }

    public int RemainingMl { get; set; }

    public int MaxMl { get; set; }

    public virtual Pump? Pump { get; set; }

    public virtual ICollection<Ingredient>? Ingredients { get; set; } = new List<Ingredient>();
}