namespace Backend.Services.DatabaseService.Models;

public class Ingredient
{
    [ForeignKey(nameof(Drink))] public int DrinkId { get; set; }

    [ForeignKey(nameof(IngredientInBottle))]
    [MaxLength(100)]
    public string IngredientName { get; set; }

    public int Ml { get; set; }

    public virtual Drink? Drink { get; set; }
    public virtual IngredientInBottle? IngredientInBottle { get; set; }
}