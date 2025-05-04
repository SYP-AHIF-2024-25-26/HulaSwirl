using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class DeleteDrink
{
    public static async Task<IResult> HandleDeleteDrink([FromQuery] int id, AppDbContext db, HttpContext httpContext)
    {
        if (!httpContext.User.IsInRole("Admin"))
            return Results.Forbid();
        
        var drink = await db.Drink.FindAsync(id);

        if (drink is null) return Results.NotFound("Drink with id not found");
        
        db.Drink.Remove(drink);
        await db.SaveChangesAsync();
        
        foreach (var ingredient in db.Ingredient)
        {
            bool isReferenced = await db.DrinkIngredient
                .AnyAsync(di => di.IngredientNameFK == ingredient.IngredientName);
            if (!isReferenced)
            {
                db.Ingredient.Remove(ingredient);
            }
        }
        await db.SaveChangesAsync();

        return Results.Ok("drink deleted");
    }
}