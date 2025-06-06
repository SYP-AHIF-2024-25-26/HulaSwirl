using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.DataAccess.Models;

public class User(
    string username,
    string email,
    string keyHash,
    string role,
    ICollection<Order>? orders = null,
    ICollection<UserDrinkStatistic>? drinkStatistics = null)
{
    public User() : this(string.Empty, string.Empty, string.Empty, string.Empty) { }

    [Key]
    [StringLength(50)]
    public string Username { get; set; } = username;

    public string KeyHash { get; set; } = keyHash;

    public string Role { get; set; } = role;

    // Navigation Properties
    public ICollection<Order> Orders { get; set; } = orders ?? new List<Order>();
    public ICollection<UserDrinkStatistic> DrinkStatistics { get; set; } = drinkStatistics ?? new List<UserDrinkStatistic>();
}
