using HulaSwirl.Services.DataAccess;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Drinks;

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