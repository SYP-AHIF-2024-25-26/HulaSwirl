using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.DataAccess.Models;

public class User(
    string username,
    string email,
    string passwordHash,
    string role,
    ICollection<DrinkOrder>? orders = null,
    ICollection<UserDrinkStatistic>? drinkStatistics = null)
{
    public User() : this(string.Empty, string.Empty, string.Empty, string.Empty) { }

    [Key]
    [StringLength(50)]
    public string Username { get; set; } = username;

    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = email;

    public string PasswordHash { get; set; } = passwordHash;

    public string Role { get; set; } = role;

    // Navigation Properties
    public ICollection<DrinkOrder> Orders { get; set; } = orders ?? new List<DrinkOrder>();
    public ICollection<UserDrinkStatistic> DrinkStatistics { get; set; } = drinkStatistics ?? new List<UserDrinkStatistic>();
}
