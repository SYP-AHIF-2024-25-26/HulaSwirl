using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sprache;

namespace Backend.Apis.Ingredients;

public static class EditDrinkIngredients
{
    public static async Task<IResult> HandleEditDrinkIngredients([FromBody] IngredientDto ingredientDto,
        AppDbContext context)
    {
        var ingredient = await context.Ingredient.FindAsync(ingredientDto.IngredientId);

        if (ingredient is null)
        {
            return Results.NotFound("Ingredient not found");
        }

        ingredient.IngredientName = ingredientDto.IngredientName;
        ingredient.Ml = ingredientDto.Quantity;

        return Results.Ok($"Ingredient edited {ingredient}");
    }

    public class IngredientDto
    {
        public required int IngredientId { get; set; }
        public required string IngredientName { get; set; }
        public required int Quantity { get; set; }
    }
}