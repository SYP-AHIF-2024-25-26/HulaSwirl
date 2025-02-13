using Backend.Services.DatabaseService;
using Backend.Services.QueueService;

namespace Backend.Apis.Drinks;

public static class OrderCustomDrink
{
    public static async Task<IResult> HandleOrderCustomDrink(List<IngredientDto> ingredientDtos,
        ILogger logger, DatabaseService dbService, QueueManager queueManager)
    {
        logger.LogInformation("Handling order custom drink");

        //map ordered ingredient to available ingredients

        var availableIngredients = await dbService.GetAllAvailableIngredients();

        var maps = availableIngredients
            .Select(availableIngredient =>
                new Map(
                    availableIngredient,
                    ingredientDtos.FirstOrDefault(ingredientDto =>
                        ingredientDto.IngredientName == availableIngredient.Name),
                    availableIngredient.Pump
                )
            ).Where(map =>
                map.IngredientDto is not null && map.Pump is not null).ToList();

        //check if ordered ingredients are available

        if (maps.Count == 0) return Results.BadRequest("Ingredients not available");

        //add to queue

        var queueItems = maps.Select(map => new QueueItem
            { PumpSlot = map.Pump!.Slot, RequiredMl = map.IngredientDto!.Ml }).ToList();

        queueManager.Queue(queueItems);

        return Results.Ok("Order Queued");
    }

    private record Map(IngredientInBottle IngredientInBottle, IngredientDto? IngredientDto, Pump? Pump);

    public class IngredientDto
    {
        public required string IngredientName { get; set; }
        public required int Ml { get; set; }
    }
}