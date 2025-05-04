using Backend.Apis.Users;
using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class EditIngredients
{
    public static async Task<IResult> HandleEditIngredients(
        [FromBody] IngredientDto[] editIngredientsDto,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!editIngredientsDto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });

        if (!httpContext.User.IsInRole("Admin"))
            return Results.Forbid();
        
        foreach (var ing in editIngredientsDto)
        {
            var ingredient = await context.Ingredient.FindAsync(ing.IngredientName);

            if (ingredient is null)
            {
                return Results.NotFound("Ingredient not found");
            }

            ingredient.IngredientName = ing.IngredientName;
            ingredient.PumpSlot = ing.PumpSlot;
            ingredient.RemainingAmount = ing.RemainingAmount;
            ingredient.MaxAmount = ing.MaxAmount;
        }

        await context.SaveChangesAsync();

        return Results.Ok("Ingredient edited");
    }
}