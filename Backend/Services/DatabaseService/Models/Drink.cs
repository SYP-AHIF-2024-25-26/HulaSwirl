using System.Text.Json.Serialization;
using Backend.Apis.Drinks;

namespace Backend.Services.DatabaseService.Models;

public class Drink(string name, bool available, string imgUrl, string toppings)
{
    Drink() : this(string.Empty, false, string.Empty, string.Empty)
    {
    }

    [Key] public int Id { get; set; }
    public string Name { get; set; } = name;
    public bool Available { get; set; } = available;
    public string ImgUrl { get; set; } = imgUrl;
    public string Toppings { get; set; } = toppings;
    public List<DrinkIngredient> DrinkIngredients { get; set; } = new();
}