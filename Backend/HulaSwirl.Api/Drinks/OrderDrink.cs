using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Pumps;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Drinks;

public static class OrderDrink
{
    public static async Task<IResult> HandleOrderDrink(
        [FromQuery] int drinkId,
        AppDbContext context,
        PumpManager manager)
    {
        var drink = await context.Drink
            .Include(d => d.DrinkIngredients)
            .FirstOrDefaultAsync(d => d.Id == drinkId);

        if (drink is null)
            return Results.NotFound("Drink not found");

        var ingredientNames = drink.DrinkIngredients.Select(i => i.IngredientNameFk).ToList();
        var availableIngredients = await context.Ingredient
            .Where(i => i.PumpSlot != null && ingredientNames.Contains(i.IngredientName))
            .ToListAsync();

        var missing = ingredientNames.Except(availableIngredients.Select(i => i.IngredientName)).ToList();
        if (missing.Count != 0)
            return Results.NotFound($"The following ingredients are not available: {string.Join(", ", missing)}");

        foreach (var di in drink.DrinkIngredients)
        {
            var stored = availableIngredients.First(i => i.IngredientName == di.IngredientNameFk);
            if (stored.RemainingAmount < di.Amount)
                return Results.BadRequest(
                    $"Not enough {di.IngredientNameFk}: available {stored.RemainingAmount}ml, needed {di.Amount}ml");
        }

        foreach (var di in drink.DrinkIngredients)
        {
            var stored = availableIngredients.First(i => i.IngredientName == di.IngredientNameFk);
            stored.RemainingAmount -= di.Amount;
        }
        await context.SaveChangesAsync();

        var pumpTasks = drink.DrinkIngredients.Select(di =>
        {
            var slot = availableIngredients
                .First(i => i.IngredientName == di.IngredientNameFk)
                .PumpSlot!.Value;
            return manager.StartPump(slot, di.Amount);
        }).ToArray();

        _ = Task.Run(async () => await Task.WhenAll(pumpTasks));

        var durationSec = drink.DrinkIngredients.Max(i => i.Amount) / 13.0;
        return Results.Ok(durationSec);
    }
}