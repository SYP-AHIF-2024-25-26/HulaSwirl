namespace HulaSwirl.Services.Dtos;

public class DrinkStatisticsDto
{
    public required string DrinkName { get; set; }
    public required int Count { get; set; }
    public required int TotalAmount { get; set; }
}

public class IngredientStatisticsDto
{
    public required string IngredientName { get; set; }
    public required int UsageCount { get; set; }
    public required int TotalAmount { get; set; }
}

public class UserDrinkCountDto
{
    public required string DrinkName { get; set; }
    public required int Count { get; set; }
}

public class UserStatisticsDto
{
    public required string User { get; set; }
    public required int TotalOrders { get; set; }
    public required List<UserDrinkCountDto> Drinks { get; set; } = [];
}

public class IntervalStatisticDto
{
    public required DateTime IntervalStart { get; set; }
    public required int Count { get; set; }
}
