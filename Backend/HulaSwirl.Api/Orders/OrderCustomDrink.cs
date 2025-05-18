using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.Pumps;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class OrderCustomDrink
{
    public static async Task<IResult> HandleOrderCustomDrink(
        List<DrinkIngredientDto> ingredientDtos, 
        AppDbContext context,
        HttpContext httpContext,
        JwtService jwtService)
    {
        if (!DrinkIngredientValidation.Validate(ingredientDtos, out var errors))
            return Results.BadRequest(new { errors });

        var orderedNames = ingredientDtos.Select(i => i.IngredientName).ToList();
        var res = await OrderValidation.ValidateRequest(orderedNames, context);
        if (res is not Ok)
            return res;
        
        var username = jwtService.GetUsernameFromToken(httpContext.Request.Headers.Authorization!);
        var drinkIngredients = ingredientDtos.Select(dto =>
            new DrinkIngredient(
                null,
                dto.IngredientName,
                dto.Amount,
                null,
                null
            )
        ).ToList();
        var order = new Order(username, DateTime.Now, "Custom drink", drinkIngredients);
        context.Order.Add(order);
        await context.SaveChangesAsync();
        return Results.Created();
    }
}
