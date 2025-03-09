namespace Backend.Services.DatabaseService.Models;

public class Pump(int slot, bool active)
{
    Pump() : this(0, false)
    {
    }

    [Key] public int Slot { get; set; } = slot;

    public bool Active { get; set; } = active;
}