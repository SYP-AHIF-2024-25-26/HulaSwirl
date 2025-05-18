using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class GetOrderHistory
{
    public static async Task<IResult> HandleGetOrderHistory(
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator()) return Results.Forbid();

        var orders = await context.Order
            .Include(o => o.DrinkIngredients)
            .ThenInclude(oi => oi.Ingredient)
            .ToListAsync();
        
        return orders.Count == 0 
            ? Results.NotFound("No orders found") 
            : Results.Ok(orders);
    }
}