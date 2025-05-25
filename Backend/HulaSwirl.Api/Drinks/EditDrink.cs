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
        [FromRoute] int id,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin()) 
            return Results.Forbid();

        return await DrinkFactory.UpdateDrinkAsync(context, id, drinkDto);
    }
}
