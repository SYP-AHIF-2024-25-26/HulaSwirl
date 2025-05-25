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
        DrinkIngredientDto[] ingredientDtos, 
        AppDbContext context,
        HttpContext httpContext,
        ObservableOrderService orderService,
        JwtService jwtService)
    {
        var orderedNames = ingredientDtos.Select(i => i.IngredientName).ToList();
        var res = await OrderValidation.ValidateRequest(orderedNames, context);
        if (res is not Ok)
            return res;

        try
        {
            var username = jwtService.GetUsernameFromToken(httpContext.Request.Headers.Authorization!);
            var drinkIngredients = ingredientDtos.Select(dto =>
                new OrderIngredient(dto.IngredientName, dto.Amount)
            ).ToList();
            var order = new Order(username, DateTime.Now, "Custom drink", drinkIngredients);
            context.Order.Add(order);
            await context.SaveChangesAsync();
            var orders = await context.Order
                .Include(o => o.OrderIngredients)
                .ToListAsync();
            await orderService.BroadcastAsync(orders);
            return Results.Created($"/api/orders", order);
        } catch (Exception ex)
        {
            return Results.Problem("An error occurred while processing the order: " + ex.Message);
        }
    }
}
