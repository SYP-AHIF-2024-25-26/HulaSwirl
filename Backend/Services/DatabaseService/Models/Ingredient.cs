using System.Text.Json.Serialization;

namespace Backend.Services.DatabaseService.Models;

public class Ingredient(string ingredientName, int ml, Drink drink)
{
    public Ingredient() : this(string.Empty, 0, null!)
    {
    }

    [Key] public int ID { get; set; }

    public int Ml { get; set; } = ml;


    // Foreign Keys
    [ForeignKey(nameof(IngredientInBottle.Name))]
    [StringLength(255)]
    public string IngredientName { get; set; } = ingredientName;

    public int DrinkID { get; set; }

    // Navigational Properties
    [JsonIgnore] public IngredientInBottle? IngredientInBottle { get; set; }
    [JsonIgnore] public Drink? Drink { get; set; } = drink;
}