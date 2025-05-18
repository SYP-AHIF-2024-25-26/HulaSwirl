using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Drinks;

public static class EditDrink
{
    public static async Task<IResult> HandleEditDrink(
        [FromBody] EditDrinkDto drinkDto,
        [FromQuery] int id,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin()) 
            return Results.Forbid();

        var drink = await context.Drink
            .Include(d => d.DrinkIngredients)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (drink is null)
            return Results.NotFound("Drink not found");

        var result = await DrinkFactory.UpdateDrinkAsync(context, drink, drinkDto);

        return result.IsSuccess
            ? Results.Ok("Drink updated")
            : Results.BadRequest(new { errors = result.Errors });
    }
}
