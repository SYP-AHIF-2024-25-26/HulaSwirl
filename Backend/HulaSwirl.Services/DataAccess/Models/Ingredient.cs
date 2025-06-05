using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HulaSwirl.Services.DataAccess.Models;

public class Ingredient(string ingredientName, int remainingAmount, int maxAmount, int? pumpSlot = null, Pump? pump = null)
{
    public Ingredient() : this(string.Empty, 0, 0) { }

    [Key]
    [StringLength(255)]
    public string IngredientName { get; set; } = ingredientName;

    public int RemainingAmount { get; set; } = remainingAmount;

    public int MaxAmount { get; set; } = maxAmount;

    [ForeignKey(nameof(Pump.Slot))]
    public int? PumpSlot { get; set; } = pumpSlot;

    public Pump? Pump { get; set; } = pump;
}
