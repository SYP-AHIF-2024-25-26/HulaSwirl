using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class DeleteDrink
{
    public static async Task<IResult> HandleDeleteDrink([FromQuery] int id, AppDbContext context)
    {
        var drink = await context.Drink.FindAsync(id);

        if (drink is null)
        {
            return Results.NotFound("Drink with id not found");
        }

        context.Drink.Remove(drink);

        await context.SaveChangesAsync();

        return Results.Ok("drink deleted");
    }
}