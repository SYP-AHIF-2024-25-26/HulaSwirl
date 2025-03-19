using System.Text.Json.Serialization;

namespace Backend.Services.DatabaseService.Models;

public class DrinkIngredient(int drinkId, string ingredientNameFk, int amount, Drink? drink, Ingredient? ingredient)
{
    public DrinkIngredient() : this(0, "", 0, null, null)
    {
    }
    
    [Key] public int Id { get; set; }
    public int DrinkId { get; set; } = drinkId;
    public string IngredientNameFK { get; set; } = ingredientNameFk;
    public int Amount { get; set; } = amount;
    [JsonIgnore] public Drink? Drink { get; set; } = drink;
    [JsonIgnore] public Ingredient? Ingredient { get; set; } = ingredient;
}