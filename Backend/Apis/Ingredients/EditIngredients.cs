using Backend.Apis.Users;
using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class EditIngredients
{
    public static async Task<IResult> HandleEditIngredients(
        [FromBody] EditIngredientsDto editIngredientsDto,
        AppDbContext context,
        [FromServices] JwtService jwtService)
    {
        if (!editIngredientsDto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });

        if (!jwtService.IsAdmin(editIngredientsDto.UserJwt))
            return Results.Unauthorized();
        
        foreach (var ing in editIngredientsDto.Ingredients)
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