using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Ingredients;

public static class DeleteIngredient
{
    public static async Task<IResult> HandleDeleteIngredient([FromQuery] int ingredientId,
        AppDbContext context)
    {
        var ingredient = await context.Ingredient.FindAsync(ingredientId);

        if (ingredient is null)
        {
            return Results.NotFound("Ingredient with id not found");
        }

        context.Ingredient.Remove(ingredient);

        //check if other ingredients also have the same ingredientName -> referencing the same drinkInBottle

        var ingredients = await context.Ingredient.Where(ing => ing.IngredientName == ingredient.IngredientName)
            .ToListAsync();

        if (ingredients.Count != 0)
        {
            var ingredientInBottle = await context.IngredientInBottle.FindAsync(ingredient.IngredientName);

            if (ingredientInBottle != null)
                context.IngredientInBottle.Remove(ingredientInBottle);
        }


        await context.SaveChangesAsync();

        return Results.Ok("Ingredient deleted");
    }
}