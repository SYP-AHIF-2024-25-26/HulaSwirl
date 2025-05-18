using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class GetAllOrders
{
    public static async Task<IResult> HandleGetAllOrders(HttpContext httpContext, AppDbContext context)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator())
            return Results.Forbid();

        var orders = await context.Order
            .Include(o => o.DrinkIngredients)
            .ToListAsync();
        
        return Results.Ok(orders);
    }
}