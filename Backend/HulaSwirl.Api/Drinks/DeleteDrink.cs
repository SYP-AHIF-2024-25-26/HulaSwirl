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

        var drink = await context.Drink.Include(d => d.DrinkIngredients).FirstOrDefaultAsync(d => d.Id == id);
        if (drink is null) return Results.NotFound("Drink with id not found");

        await using var tx = await context.Database.BeginTransactionAsync();
        try
        {
            context.Drink.Remove(drink);
            await context.SaveChangesAsync();
            await IngredientService.RemoveUnreferencedIngredientsAsync(context);
            await tx.CommitAsync();
            return Results.NoContent();
        } catch (DbUpdateException e)
        {
            await tx.RollbackAsync();
            return Results.Problem(e.Message, statusCode: 500);
        }
    }
}
