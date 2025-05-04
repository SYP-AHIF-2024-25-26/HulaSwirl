using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Ingredients;

public static class GetAllIngredients
{
    public static async Task<List<IngredientDto>> HandleGetAllIngredients(AppDbContext context)
    {
        var ingredients = await context.Ingredient.ToListAsync();

        return ingredients.Select(ig => new IngredientDto
        {
            IngredientName = ig.IngredientName,
            RemainingAmount = ig.RemainingAmount,
            PumpSlot = ig.PumpSlot,
            MaxAmount = ig.MaxAmount
        }).ToList();
    }
}