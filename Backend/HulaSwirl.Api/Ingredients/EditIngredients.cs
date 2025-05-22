using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;

namespace HulaSwirl.Api.Ingredients;

public static class EditIngredients
{
    public static async Task<IResult> HandleEditIngredients([FromBody] IngredientDto[] editIngredientsDto, AppDbContext context, HttpContext httpContext)
    {
        if (!httpContext.IsAdmin())
            return Results.Forbid();

        var result = await IngredientService.BulkUpdateAsync(context, editIngredientsDto);

        return result.IsSuccess
            ? Results.Ok(result.Value.Count)
            : Results.BadRequest(result.Errors);
    }
}