using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Ingredients;

public static class GetIngredientsInBottle
{
    public static async Task<List<IngredientInBottleDto>> HandleGetIngredientsInBottle(AppDbContext context)
    {
        var ingredients = await context.Ingredient.ToListAsync();

        return ingredients.Select(ig => new IngredientInBottleDto
        {
            IngredientName = ig.IngredientName,
            RemainingAmount = ig.RemainingAmount,
            PumpSlot = ig.PumpSlot,
            MaxAmount = ig.MaxAmount
        }).ToList();
    }

    public class IngredientInBottleDto()
    {
        public required string IngredientName { get; set; }
        public required int RemainingAmount { get; set; }
        public required int? PumpSlot { get; set; }
        public required int MaxAmount { get; set; }
    }
}