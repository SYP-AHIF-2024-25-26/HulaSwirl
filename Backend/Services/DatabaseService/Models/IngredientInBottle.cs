namespace Backend.Services.DatabaseService.Models;

public class IngredientInBottle(string name, int remainingMl, int maxMl)
{
    public IngredientInBottle() : this(string.Empty, 0, 0)
    {
    }

    [StringLength(255)]
    [Key] public string Name { get; set; } = name;

    public int RemainingMl { get; set; } = remainingMl;

    public int MaxMl { get; set; } = maxMl;

    // Foreign Key
    [ForeignKey(nameof(Pump.Slot))]
    public int? PumpSlot { get; set; }

    // Navigational Property
    public Pump? Pump { get; set; }
}