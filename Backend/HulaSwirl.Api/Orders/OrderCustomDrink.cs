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
        var allIngredients = await context.Ingredient
            .Where(i => orderedNames.Select(n => n.ToLower()).Contains(i.IngredientName.ToLower()))
            .ToListAsync();

        var drinkIngredients = ingredientDtos.Select(dto =>
            new DrinkIngredient(
                0,
                dto.IngredientName,
                dto.Amount,
                null,
                allIngredients.First(i => string.Equals(i.IngredientName, dto.IngredientName, StringComparison.CurrentCultureIgnoreCase))
            )
        ).ToList();
        var order = new Order(username, DateTime.UtcNow, "Custom drink", drinkIngredients);
        context.Order.Add(order);
        await context.SaveChangesAsync();
        return Results.Created();
    }
}
