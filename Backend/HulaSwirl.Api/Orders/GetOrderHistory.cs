using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class GetOrderHistory
{
    public static async Task<IResult> HandleGetOrderHistory(
        [FromRoute] int orderId,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator()) return Results.Forbid();

        var order = await context.Order
            .Include(o => o.DrinkIngredients)
            .ThenInclude(oi => oi.Ingredient)
            .FirstOrDefaultAsync(o => o.Id == orderId);
        if (order is null) return Results.NotFound("Order not found");

        return Results.Ok(order);
    }
}