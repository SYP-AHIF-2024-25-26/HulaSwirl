namespace Backend.Services.DatabaseService.Models;

public class Order(int id, DateOnly date)
{
    Order() : this(0, new DateOnly())
    {
    }

    [Key] public int ID { get; set; } = id;
    public DateOnly OrderDate { get; set; } = date;


    // Foreign key
    public int? DrinkID { get; set; }

    // Navigation property
    public Drink? Drink { get; set; }
}