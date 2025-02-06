namespace NewBackend.Services.DatabaseService.Models;

public class DrinkIngredient {
    [ForeignKey(nameof(Drink))] public int DrinkId { get; set; }

    [ForeignKey(nameof(Ingredient))]
    [MaxLength(100)]
    public string IngredientName { get; set; }

    public int Ml { get; set; }

    public virtual Drink? Drink { get; set; }
    public virtual Ingredient? Ingredient { get; set; }
}