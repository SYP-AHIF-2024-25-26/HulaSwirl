using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Ingredients;

public static class GetAllIngredients
{
    public static async Task<IResult> HandleGetAllIngredients(AppDbContext db, HttpContext httpContext)
    {
        var ingredients = await db.Ingredient.ToListAsync();

        return Results.Ok(ingredients.Select(ig => new IngredientDto
        {
            IngredientName = ig.IngredientName,
            RemainingAmount = ig.RemainingAmount,
            PumpSlot = ig.PumpSlot,
            MaxAmount = ig.MaxAmount
        }).ToList());
    }
}