using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.DataAccess.Models;

public class User(
    string username,
    string keyHash,
    string role,
    DateTime createdAt,
    DateTime? lastLogin,
    ICollection<Order>? orders = null,
    ICollection<UserDrinkStatistic>? drinkStatistics = null)
{
    public User() : this(string.Empty, string.Empty, string.Empty, DateTime.Now, null) { }

    [Key]
    [StringLength(50)]
    public string Username { get; set; } = username;

    public string KeyHash { get; set; } = keyHash;

    public string Role { get; set; } = role;
    
    public DateTime CreatedAt { get; set; } = createdAt;
    
    public DateTime? LastLogin { get; set; } = lastLogin;

    // Navigation Properties
    public ICollection<Order> Orders { get; set; } = orders ?? new List<Order>();
    public ICollection<UserDrinkStatistic> DrinkStatistics { get; set; } = drinkStatistics ?? new List<UserDrinkStatistic>();
}
