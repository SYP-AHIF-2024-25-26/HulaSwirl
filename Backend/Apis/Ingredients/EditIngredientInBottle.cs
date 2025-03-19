using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class EditIngredientInBottle
{
    public static async Task<IResult> HandleEditIngredientInBottle(
        [FromBody] IngredientInBottleDto[] ingredientInBottleDtos,
        AppDbContext context)
    {
        foreach (var ingredientInBottleDto in ingredientInBottleDtos)
        {
            var ingredientInBottle = await context.Ingredient.FindAsync(ingredientInBottleDto.IngredientName);

            if (ingredientInBottle is null)
            {
                return Results.NotFound("Ingredient in bottle not found");
            }

            ingredientInBottle.IngredientName = ingredientInBottleDto.IngredientName;
            ingredientInBottle.PumpSlot = ingredientInBottleDto.PumpSlot;
            ingredientInBottle.RemainingAmount = ingredientInBottleDto.RemainingAmount;
            ingredientInBottle.MaxAmount = ingredientInBottleDto.MaxAmount;
        }

        await context.SaveChangesAsync();

        return Results.Ok("Ingredient edited");
    }

    public class IngredientInBottleDto
    {
        public required string IngredientName { get; set; }
        public required int? PumpSlot { get; set; }
        public required int RemainingAmount { get; set; }
        public required int MaxAmount { get; set; }
    }
}