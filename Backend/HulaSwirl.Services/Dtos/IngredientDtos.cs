namespace HulaSwirl.Services.Dtos;

public class DrinkIngredientDto
{
    public required string IngredientName { get; set; }
    public required int Amount { get; set; }
}

public class IngredientDto
{
    public required string IngredientName { get; set; }
    public required int RemainingAmount { get; set; }
    public required int? PumpSlot { get; set; }
    public required int MaxAmount { get; set; }
}