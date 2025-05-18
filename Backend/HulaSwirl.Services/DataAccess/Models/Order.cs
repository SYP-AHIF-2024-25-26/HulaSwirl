using System.ComponentModel.DataAnnotations;
using HulaSwirl.Services.OrderService;

namespace HulaSwirl.Services.DataAccess.Models;

public class Order(string username, DateTime orderDate, string drinkName, List<DrinkIngredient> ingredients)
{
    public Order() : this(string.Empty, DateTime.MinValue, string.Empty, []) { }

    public int Id { get; set; }
    [StringLength(50)]
    public string Username { get; set; } = username;
    public DateTime OrderDate { get; set; } = orderDate;
    [StringLength(255)]
    public string DrinkName { get; set; } = drinkName;
    public List<DrinkIngredient> DrinkIngredients { get; set; } = ingredients;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
}