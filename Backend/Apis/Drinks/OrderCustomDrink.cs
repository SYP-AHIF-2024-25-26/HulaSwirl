using Backend.Apis.Ingredients;
using Backend.Services.DatabaseService;
using Backend.Services.PumpService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class OrderCustomDrink
{
    public static async Task<IResult> HandleOrderCustomDrink(List<DrinkIngredientDto> ingredientDtos, AppDbContext context, PumpManager manager)
    {
        var orderedIngredientNames = ingredientDtos.Select(i => i.IngredientName).ToList();

        var ingredients = await context.Ingredient
            .Include(i => i.Pump)
            .Where(i => i.PumpSlot != null)
            .ToListAsync();

        var missingIngredients = orderedIngredientNames
            .Except(ingredients.Select(i => i.IngredientName))
            .ToList();

        if (missingIngredients.Any())
            return Results.NotFound($"The following ingredients are not available: {string.Join(", ", missingIngredients)}");

        if (ingredientDtos.Sum(i => i.Amount) > 500)
            return Results.BadRequest("Your drink can't contain more than 500ml");
        
        foreach (var ordered in ingredientDtos)
        {
            if (ordered.Amount is <= 0 or > 500)
                return Results.BadRequest($"Invalid amount for ingredient {ordered.IngredientName}: {ordered.Amount}ml (allowed: 1–500)");

            var stored = ingredients.First(i => i.IngredientName == ordered.IngredientName);

            if (stored.RemainingAmount < ordered.Amount)
                return Results.BadRequest($"Not enough {ordered.IngredientName} available: {stored.RemainingAmount}ml left but {ordered.Amount}ml needed");
        }

        _ = Task.Run(async () =>
        {
            var pumpTasks = ingredientDtos.Select(dto => 
                manager.StartPump(
                    ingredients.First(i => i.IngredientName == dto.IngredientName).PumpSlot!.Value,
                    dto.Amount
                )
            );
            await Task.WhenAll(pumpTasks);
        });

        foreach (var dto in ingredientDtos)
        {
            var stored = ingredients.First(i => i.IngredientName == dto.IngredientName);
            stored.RemainingAmount -= dto.Amount;
        }
        await context.SaveChangesAsync();

        var durationSec = ingredientDtos.Max(i => i.Amount) / 13.0;
        return Results.Ok(durationSec);
    }
}