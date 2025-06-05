using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.DataAccess.Models;

public class Pump(int slot, bool active)
{
    public Pump() : this(0, false) { }

    [Key]
    public int Slot { get; set; } = slot;

    public bool Active { get; set; } = active;
}