using System.ComponentModel.DataAnnotations;

namespace NewBackend.Services.DatabaseService.Models;

public class Drink {
    [Key] public int Id { get; set; }

    [MaxLength(100)] public string Name { get; set; }

    public bool Enabled { get; set; }

    public byte[]? Img { get; set; }

    [MaxLength(255)] public string? Toppings { get; set; }

    public virtual ICollection<DrinkIngredient> DrinkIngredients { get; set; } = new List<DrinkIngredient>();
}