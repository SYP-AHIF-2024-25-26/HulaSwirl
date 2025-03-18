using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class EditIngredientInBottle
{
    public static async Task<IResult> HandleEditIngredientInBottle(
        [FromBody] IngredientInBottleDto ingredientInBottleDto,
        AppDbContext context)
    {
        var ingredientInBottle = await context.IngredientInBottle.FindAsync(ingredientInBottleDto.IngredientName);

        if (ingredientInBottle is null)
        {
            return Results.NotFound("Ingredient in bottle not found");
        }

        ingredientInBottle.Name = ingredientInBottleDto.IngredientName;
        ingredientInBottle.PumpSlot = ingredientInBottleDto.PumpSlot;
        ingredientInBottle.RemainingMl = ingredientInBottleDto.RemainingMl;
        ingredientInBottle.MaxMl = ingredientInBottleDto.MaxAmount;


        await context.SaveChangesAsync();

        return Results.Ok("Ingredient edited");
    }

    public class IngredientInBottleDto
    {
        public required string IngredientName { get; set; }
        public required int? PumpSlot { get; set; }
        public required int RemainingMl { get; set; }
        public required int MaxAmount { get; set; }
    }
}