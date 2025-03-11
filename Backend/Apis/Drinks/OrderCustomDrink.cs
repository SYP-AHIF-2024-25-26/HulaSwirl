using Backend.Services.DatabaseService;
using Backend.Services.PumpService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class OrderCustomDrink
{
    public static async Task<IResult> HandleOrderCustomDrink(List<IngredientDto> ingredientDtos, AppDbContext context, PumpManager manager)
    {
        //map ordered ingredient to available ingredients
        var orderedIngredientNames = ingredientDtos.Select(ingDto => ingDto.IngredientName).ToList();

        var ingredients = await context.IngredientInBottle
            .Include(ing => ing.Pump)
            .Where(ing => ing.PumpSlot != null)
            .ToListAsync();

        var missingIngredients = orderedIngredientNames
            .Except(ingredients.Select(ing => ing.Name)).ToList();

        if (missingIngredients.Count != 0)
        {
            return Results.NotFound("Ordered ingredients are not available");
        }

        foreach (var orderedIngredient in ingredientDtos)
        {
            var existingIngredient = ingredients
                .First(ing => ing.Name == orderedIngredient.IngredientName)!;

            await manager.StartPump(existingIngredient.PumpSlot, orderedIngredient.Ml);
        }

        return Results.Ok("Ordered");
    }


    public class IngredientDto
    {
        public required string IngredientName { get; set; }
        public required int Ml { get; set; }
    }
}