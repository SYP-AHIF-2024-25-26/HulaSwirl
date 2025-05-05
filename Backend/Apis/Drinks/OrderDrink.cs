using Backend.Services.DatabaseService;
using Backend.Services.PumpService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class OrderDrink
{
    public static async Task<IResult> HandleOrderDrink([FromQuery] int drinkId, AppDbContext context, PumpManager manager)
    {
        var drink = await context.Drink
            .Include(d => d.DrinkIngredients)
            .FirstOrDefaultAsync(d => d.Id == drinkId);

        if (drink is null)
            return Results.NotFound("Drink not found");

        var ingredientNames = drink.DrinkIngredients.Select(i => i.IngredientNameFK).ToList();

        var availableIngredients = await context.Ingredient
            .Include(i => i.Pump)
            .Where(i => ingredientNames.Contains(i.IngredientName))
            .ToListAsync();

        var missingIngredients = ingredientNames.Except(availableIngredients.Select(i => i.IngredientName)).ToList();
        if (missingIngredients.Any())
            return Results.NotFound($"The following ingredients are not available: {string.Join(", ", missingIngredients)}");

        foreach (var drinkIngredient in drink.DrinkIngredients)
        {
            var matched = availableIngredients.First(i => i.IngredientName == drinkIngredient.IngredientNameFK);

            if (matched.RemainingAmount < drinkIngredient.Amount)
            {
                return Results.BadRequest(
                    $"Not enough {drinkIngredient.IngredientNameFK} available: {drinkIngredient.Amount}ml left but needed {matched.RemainingAmount}ml");
            }
        }
        
        foreach (var di in drink.DrinkIngredients)
        {
            var stored = availableIngredients.First(i => i.IngredientName == di.IngredientNameFK);
            stored.RemainingAmount -= di.Amount;
        }

        await context.SaveChangesAsync();

        foreach (var drinkIngredient in drink.DrinkIngredients)
        {
            var matched = availableIngredients.First(i => i.IngredientName == drinkIngredient.IngredientNameFK);
            await manager.StartPump(matched.PumpSlot!.Value, drinkIngredient.Amount);
        }

        return Results.Ok(drink.DrinkIngredients.Sum(i => i.Amount) / 13);
    }
}