using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Ingredients;

public static class GetAllIngredients
{
    public static async Task<IResult> HandleGetAllIngredients(AppDbContext db, HttpContext httpContext)
    {
        if(!httpContext.User.IsInRole("Admin"))
            return Results.Forbid();
        
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