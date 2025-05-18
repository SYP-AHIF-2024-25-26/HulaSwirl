using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class CancelOrder
{
    public static async Task<IResult> HandleCancelOrder(
        [FromRoute] int orderId,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator()) return Results.Forbid();

        var order = await context.Order.FirstOrDefaultAsync(o => o.Id == orderId);
        if (order is null) return Results.NotFound("Order not found");
        if (order.Status != OrderStatus.Pending) return Results.BadRequest("Order was already processed");
        order.Status = OrderStatus.Cancelled;
        await context.SaveChangesAsync();
        return Results.Ok("Order cancelled");
    }
}