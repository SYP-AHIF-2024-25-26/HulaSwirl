using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NewBackend.Services.DatabaseService.Models;

public class Pump {
    [Key] public int Slot { get; set; }

    [MaxLength(100)] public string? IngredientName { get; set; }

    public bool Active { get; set; }

    [ForeignKey(nameof(IngredientName))] public virtual Ingredient? Ingredient { get; set; }
}