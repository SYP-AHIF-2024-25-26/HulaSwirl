using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class GetDrinkInfo
{
    public static async Task<IResult> HandleGetDrinkInfo([FromQuery] string id, AppDbContext context)
    {
        var drink = await context.Drink
            .Include(drink => drink.DrinkIngredients)
            .FirstOrDefaultAsync(drink => drink.Id == int.Parse(id));
        return drink != null ? Results.Ok(drink) : Results.NotFound();
    }
}