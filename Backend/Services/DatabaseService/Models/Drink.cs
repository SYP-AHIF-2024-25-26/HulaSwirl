using System.Text.Json.Serialization;

namespace Backend.Services.DatabaseService.Models;

public class Drink(int id, string name, bool enabled, string imgUrl, string toppings)
{
    Drink() : this(0, string.Empty, false, string.Empty, string.Empty)
    {
    }

    [Key] public int ID { get; set; } = id;

    [StringLength(255)] public string Name { get; set; } = name;

    public bool Enabled { get; set; } = enabled;
    [StringLength(1024)] public string ImgUrl { get; set; } = imgUrl;
    [StringLength(1024)] public string Toppings { get; set; } = toppings;


    // Navigation property
    public List<Ingredient> DrinkIngredients { get; set; } = new List<Ingredient>();
}