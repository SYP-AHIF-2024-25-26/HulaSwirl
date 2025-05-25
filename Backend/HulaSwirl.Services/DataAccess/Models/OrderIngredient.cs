using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HulaSwirl.Services.DataAccess.Models;

public class OrderIngredient(string ingredientName, int amount)
{
    public OrderIngredient() : this(string.Empty, 0) { }
    
    [Key] public int Id { get; set; }
    
    [StringLength(255)]
    public string IngredientName { get; set; } = ingredientName;
    public int Amount { get; set; } = amount;
}