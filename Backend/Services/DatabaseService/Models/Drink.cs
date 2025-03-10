using System.Text.Json.Serialization;

namespace Backend.Services.DatabaseService.Models;

public class Drink(string name, bool available, string imgUrl, string toppings)
{
    Drink() : this(string.Empty, false, string.Empty, string.Empty)
    {
    }

    [Key] public int ID { get; set; }

    [StringLength(255)] public string Name { get; set; } = name;

    public bool Available { get; set; } = available;
    [StringLength(1024)] public string ImgUrl { get; set; } = imgUrl;
    [StringLength(1024)] public string Toppings { get; set; } = toppings;

    // Navigation property
    public List<Ingredient> DrinkIngredients { get; set; } = new List<Ingredient>();
}