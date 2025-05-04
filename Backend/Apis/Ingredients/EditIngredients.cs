using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class EditIngredients
{
    public static async Task<IResult> HandleEditIngredients(
        [FromBody] IngredientDto[] ingredientInBottleDtos,
        AppDbContext context)
    {
        foreach (var ingredientInBottleDto in ingredientInBottleDtos)
        {
            var ingredientInBottle = await context.Ingredient.FindAsync(ingredientInBottleDto.IngredientName);

            if (ingredientInBottle is null)
            {
                return Results.NotFound("Ingredient not found");
            }

            ingredientInBottle.IngredientName = ingredientInBottleDto.IngredientName;
            ingredientInBottle.PumpSlot = ingredientInBottleDto.PumpSlot;
            ingredientInBottle.RemainingAmount = ingredientInBottleDto.RemainingAmount;
            ingredientInBottle.MaxAmount = ingredientInBottleDto.MaxAmount;
        }

        await context.SaveChangesAsync();

        return Results.Ok("Ingredient edited");
    }
}