using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Ingredients;

public static class GetAllIngredients
{
    public static async Task<List<IngredientDto>> HandleGetAllIngredients(AppDbContext context)
    {
        var ingredients = (await context.Ingredient.ToListAsync())
            .DistinctBy(ing => ing.IngredientName).ToList();

        return ingredients.DistinctBy(ing => ing.IngredientName).ToList()
            .Select(ing => new IngredientDto
                { IngredientName = ing.IngredientName, Quantity = ing.Ml })
            .ToList();
    }

    public class IngredientDto
    {
        public required string IngredientName { get; set; }
        public required int Quantity { get; set; }
    }
}