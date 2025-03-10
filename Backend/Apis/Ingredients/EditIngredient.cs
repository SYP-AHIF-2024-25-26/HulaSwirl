using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class EditIngredient
{
    public static async Task<IResult> HandleEditIngredient([FromBody] IngredientDto ingredientDto,
        AppDbContext context)
    {
        var ingredient = await context.Ingredient.FindAsync(ingredientDto.IngredientId);

        if (ingredient is null)
        {
            return Results.NotFound("Ingredient not found");
        }

        ingredient.IngredientName = ingredientDto.IngredientName;
        ingredient.Ml = ingredientDto.Quantity;

        await context.SaveChangesAsync();

        return Results.Ok("Ingredient edited");
    }

    public class IngredientDto
    {
        public required int IngredientId { get; set; }
        public required string IngredientName { get; set; }
        public required int Quantity { get; set; }
    }
}