using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Drinks;

public static class DeleteDrink
{
    public static async Task<IResult> HandleDeleteDrink([FromRoute] int id, AppDbContext context, HttpContext httpContext)
    {
        if (!httpContext.IsAdmin()) 
            return Results.Forbid();

        var drink = await context.Drink.FindAsync(id);
        if (drink is null) 
            return Results.NotFound("Drink with id not found");

        context.Drink.Remove(drink);
        await IngredientService.RemoveUnreferencedIngredientsAsync(context);
        await context.SaveChangesAsync();

        return Results.NoContent();
    }
}
