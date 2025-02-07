namespace NewBackend.Apis.Drinks;

public static class OrderCustomDrink {
    public static async Task<IResult> HandleOrderCustomDrink(List<IngredientDto> ingredientDtos,
        ILogger logger) {
        logger.LogInformation("Handling order custom drink");




        return null;
    }
}

public class IngredientDto() {
    public required string IngredientName { get; set; }
    public required int Ml { get; set; }
}