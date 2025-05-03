namespace Backend.Services.DatabaseService.Models;

public class UserDrinkStatistic
{
    public int UserId { get; set; }
    public int DrinkId { get; set; }
    public int Count { get; set; }

    // Navigation Properties
    public User User { get; set; } = null!;
    public Drink Drink { get; set; } = null!;
}