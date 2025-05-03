namespace Backend.Services.DatabaseService.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = null!;

    // Navigation Properties
    public ICollection<DrinkOrder> Orders { get; set; } = new List<DrinkOrder>();
    public ICollection<UserDrinkStatistic> DrinkStatistics { get; set; } = new List<UserDrinkStatistic>();
}