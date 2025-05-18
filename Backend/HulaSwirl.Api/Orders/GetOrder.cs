using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class GetOrder
{
    public static async Task<IResult> HandleGetOrder(
        [FromRoute] int orderId,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator()) return Results.Forbid();

        var order = await context.Order
            .Include(o => o.DrinkIngredients)
            .ThenInclude(oi => oi.Ingredient)
            .FirstOrDefaultAsync(o => o.Id == orderId);
        return order is null ? Results.NotFound("Order not found") : Results.Ok(order);
    }
}