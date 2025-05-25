using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.Pumps;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Any;

namespace HulaSwirl.Api.Orders;

public static class ConfirmOrder
{
    public static async Task<IResult> HandleConfirmOrder(
        [FromRoute] int orderId, 
        AppDbContext context,
        PumpManager manager,
        ObservableOrderService orderService,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator()) return Results.Forbid();

        var order = await context.Order
            .Include(o => o.OrderIngredients)
            .FirstOrDefaultAsync(o => o.Id == orderId);
        if(order is null) return Results.NotFound("Order not found");
        if (order.Status != OrderStatus.Pending) return Results.BadRequest("Order was already processed");
        
        var res = await OrderValidation.ValidateConfirmation(order.OrderIngredients, context);
        if (res is not Ok<double>) return res;

        try
        {
            foreach (var di in order.OrderIngredients)
            {
                var stored = context.Ingredient.First(i => i.IngredientName.ToLower() == di.IngredientName.ToLower());
                stored.RemainingAmount -= di.Amount;
            }

            order.Status = OrderStatus.Confirmed;
            await context.SaveChangesAsync();

            var pumpTasks = order.OrderIngredients.Select(di =>
            {
                var slot = context.Ingredient
                    .First(i => i.IngredientName == di.IngredientName)
                    .PumpSlot!.Value;
                return manager.StartPump(slot, di.Amount);
            }).ToArray();
            _ = Task.Run(async () => await Task.WhenAll(pumpTasks));

            var orders = await context.Order
                .Include(o => o.OrderIngredients)
                .ToListAsync();
            await orderService.BroadcastAsync(orders);
            return res;
        } catch (Exception ex)
        {
            return Results.Problem("An error occurred while processing the order: " + ex.Message);
        }
    }
}