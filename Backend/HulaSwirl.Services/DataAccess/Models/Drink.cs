using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.DataAccess.Models;

public class Drink(string name, bool available, string imgUrl, string toppings, List<DrinkIngredient> drinkIngredients)
{
    public Drink() : this(string.Empty, false, string.Empty, string.Empty, []) { }

    [Key] public int Id { get; set; }
    [StringLength(255)]
    public string Name { get; set; } = name;
    public bool Available { get; set; } = available;
    public string ImgUrl { get; set; } = imgUrl;
    public string Toppings { get; set; } = toppings;
    public List<DrinkIngredient> DrinkIngredients { get; set; } = drinkIngredients;
}