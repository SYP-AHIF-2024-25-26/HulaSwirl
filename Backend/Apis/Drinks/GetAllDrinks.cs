using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class GetAllDrinks
{
    public static async Task<List<Drink>> HandleGetAllDrinks(AppDbContext context)
    {
        return await context.Drink.Include(d => d.DrinkIngredients).ToListAsync();
    }
}