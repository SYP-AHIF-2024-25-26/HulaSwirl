using Backend.Services.DatabaseService;
using Backend.Services.PumpService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class OrderDrink
{
    public static async Task<IResult> HandleOrderDrink([FromQuery] int drinkId, AppDbContext context, PumpManager pumpManager)
    {
        var drink = await context.Drink
            .Include(d => d.DrinkIngredients)
            .Include(d => d.DrinkIngredients)
            .FirstOrDefaultAsync(d => d.Id == drinkId);


        if (drink is null)
        {
            return Results.NotFound("Drink not found");
        }

        foreach (var ingredient in drink.DrinkIngredients)
        {
            var ingredientInBottle = await context.Ingredient
                .Include(i => i.Pump)
                .FirstOrDefaultAsync(ingD => ingD.IngredientName == ingredient.IngredientNameFK);

            if (ingredientInBottle is null)
            {
                return Results.NotFound("Ingredient not found");
            }

            var pump = ingredientInBottle.Pump;

            if (pump is null)
            {
                return Results.NotFound("Pump not found");
            }


            await pumpManager.StartPump(pump.Slot, ingredient.Amount);
        }

        return Results.Ok("Drink ordered");
    }
}