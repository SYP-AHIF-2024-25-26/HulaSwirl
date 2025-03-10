using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Ingredients;

public static class GetIngredientsInBottle
{
    public static async Task<List<IngredientInBottleDto>> HandleGetIngredientsInBottle(AppDbContext context)
    {
        var ingredients = await context.IngredientInBottle.ToListAsync();

        return ingredients.Select(ig => new IngredientInBottleDto
        {
            Name = ig.Name,
            RemainingMl = ig.RemainingMl,
            PumpSlot = ig.PumpSlot,
            MaxMl = ig.MaxMl
        }).ToList();
    }

    public class IngredientInBottleDto()
    {
        public required string Name { get; set; }
        public required int RemainingMl { get; set; }
        public required int? PumpSlot { get; set; }
        public required int MaxMl { get; set; }
    }
}