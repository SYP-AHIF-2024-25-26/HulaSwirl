using System.ComponentModel.DataAnnotations;

namespace HulaSwirl.Services.DataAccess.Models;

public class UserDrinkStatistic(string userName, int drinkId, int count, User user, Drink drink)
{
    public UserDrinkStatistic() : this(string.Empty, 0, 0, null!, null!) { }

    [StringLength(50)]
    public string UserName { get; set; } = userName;

    public int DrinkId { get; set; } = drinkId;

    public int Count { get; set; } = count;

    // Navigation Properties
    public User User { get; set; } = user;
    public Drink Drink { get; set; } = drink;
}
