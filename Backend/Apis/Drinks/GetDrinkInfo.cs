using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class GetDrinkInfo
{
    public static async Task<Drink> HandleGetDrinkInfo([FromQuery] string id, AppDbContext context)
    {
        return (await context.Drink
            .Include(drink => drink.DrinkIngredients)
            .FirstOrDefaultAsync(drink => drink.ID == int.Parse(id)))!;
    }
}