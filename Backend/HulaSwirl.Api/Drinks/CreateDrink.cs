using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;

namespace HulaSwirl.Api.Drinks;

public static class CreateDrink
{
    public static async Task<IResult> HandleCreateDrink(
        [FromBody] EditDrinkDto drinkDto,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin()) 
            return Results.Forbid();

        return await DrinkFactory.CreateDrinkAsync(context, drinkDto);
    }
}
