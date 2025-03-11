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

        await context.SaveChangesAsync();

        return Results.Ok("Ingredient deleted");
    }
}