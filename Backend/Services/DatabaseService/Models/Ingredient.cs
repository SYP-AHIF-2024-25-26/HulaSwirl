namespace Backend.Services.DatabaseService.Models;

public class Ingredient(string ingredientName, int remainingAmount, int maxAmount)
{
    public Ingredient() : this(string.Empty, 0, 0)
    {
    }

    [StringLength(255)]
    [Key] public string IngredientName { get; set; } = ingredientName;

    public int RemainingAmount { get; set; } = remainingAmount;

    public int MaxAmount { get; set; } = maxAmount;

    [ForeignKey(nameof(Pump.Slot))]
    public int? PumpSlot { get; set; }

    public Pump? Pump { get; set; }
}