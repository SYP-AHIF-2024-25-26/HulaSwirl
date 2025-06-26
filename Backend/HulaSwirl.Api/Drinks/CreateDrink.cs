using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;

namespace HulaSwirl.Api.Drinks;

public static class CreateDrink
{
    public static async Task<IResult> HandleCreateDrink(
        [FromBody] EditDrinkDto drinkDto,
        IConfiguration config,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin()) return ErrorResults.Forbidden();

        return await DrinkFactory.CreateDrinkAsync(context, drinkDto);
    }
}
