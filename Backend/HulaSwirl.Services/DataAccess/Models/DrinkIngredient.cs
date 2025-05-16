using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HulaSwirl.Services.DataAccess.Models;

public class DrinkIngredient(int drinkId, string ingredientNameFk, int amount, Drink? drink, Ingredient? ingredient)
{
    public DrinkIngredient() : this(0, string.Empty, 0, null, null) { }
    
    [Key] public int Id { get; set; }
    public int DrinkId { get; set; } = drinkId;
    
    [StringLength(255)]
    public string IngredientNameFk { get; set; } = ingredientNameFk;
    public int Amount { get; set; } = amount;
    [JsonIgnore] public Drink? Drink { get; set; } = drink;
    [JsonIgnore] public Ingredient? Ingredient { get; set; } = ingredient;
}