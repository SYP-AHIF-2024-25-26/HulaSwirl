using System.Text.Json.Serialization;

namespace Backend.Services.DatabaseService.Models;

public class Ingredient(int id, string ingredientName, int ml, int drinkID)
{
    public Ingredient() : this(0, string.Empty, 0, 0)
    {
    }

    [Key]
    public int ID { get; set; } = id;

    public int Ml { get; set; } = ml;


    // Foreign Keys
    [ForeignKey(nameof(IngredientInBottle.Name))]
    [StringLength(255)]
    public string IngredientName { get; set; } = ingredientName;
    public int DrinkID { get; set; } = drinkID;

    // Navigational Properties
    [JsonIgnore]
    public IngredientInBottle? IngredientInBottle { get; set; }
    [JsonIgnore]
    public Drink? Drink { get; set; }

}