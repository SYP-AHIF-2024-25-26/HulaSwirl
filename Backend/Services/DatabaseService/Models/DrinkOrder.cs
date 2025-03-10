namespace Backend.Services.DatabaseService.Models;

public class DrinkOrder(DateOnly date)
{
    DrinkOrder() : this(new DateOnly())
    {
    }

    [Key] public int ID { get; set; }
    public DateOnly OrderDate { get; set; } = date;


    // Foreign key
    public int? DrinkID { get; set; }

    // Navigation property
    public Drink? Drink { get; set; }
}