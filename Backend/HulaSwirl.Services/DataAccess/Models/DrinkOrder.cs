namespace HulaSwirl.Services.DataAccess.Models;

public class DrinkOrder(int userId, int drinkId, DateTime orderDate, User user, Drink drink)
{
    public DrinkOrder() : this(0, 0, DateTime.UtcNow, null!, null!) { }

    public int Id { get; set; }

    public int UserId { get; set; } = userId;
    public int DrinkId { get; set; } = drinkId;
    public DateTime OrderDate { get; set; } = orderDate;

    public User User { get; set; } = user;
    public Drink Drink { get; set; } = drink;
}
