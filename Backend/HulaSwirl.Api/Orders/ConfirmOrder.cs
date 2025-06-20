using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.Pumps;
using HulaSwirl.Services.UserServices;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Any;

namespace HulaSwirl.Api.Orders;

public static class ConfirmOrder
{
    private static readonly Lock PumpLock = new();
    
    public static async Task<IResult> HandleConfirmOrder(
        [FromRoute] int orderId,
        AppDbContext context,
        PumpManager manager,
        ObservableOrderService orderService,
        IConfiguration config,
        HttpContext httpContext)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator()) return Results.Forbid();

        var order = await context.Order
            .Include(o => o.OrderIngredients)
            .FirstOrDefaultAsync(o => o.Id == orderId);
        if (order is null) return ErrorResults.NotFound("Order not found");
        if (order.Status != OrderStatus.Pending)
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = "Order was already processed",
                Target = string.Empty
            });

        var ingredientNames = order.OrderIngredients.Select(i => i.IngredientName).ToList();
        var availableIngredients = await IngredientService.GetAllAvailableIngredientsAsync(ingredientNames, context);
        
        var availablePumps = config.GetValue<int>("HulaConfig:AvailablePumpCount");
        if (order.OrderIngredients.Count > availablePumps)
        {
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = $"You can only order up to {availablePumps} ingredients.",
                Target = string.Empty
            });
        }
        
        foreach (var di in order.OrderIngredients)
        {
            var stored = availableIngredients.First(i => i.IngredientName == di.IngredientName);
            if (stored.RemainingAmount < di.Amount)
            {
                return ErrorResults.BadRequest(new ErrorDto
                {
                    Message = $"Need {di.Amount}ml of {di.IngredientName} but only {stored.MaxAmount}ml are available",
                    Target = di.IngredientName
                });
            }
        }
        var durationSec = order.OrderIngredients.Max(i => i.Amount) / config.GetValue<double>("HulaConfig:MlPerSecond");

        await using var tx = await context.Database.BeginTransactionAsync();
        try
        {
            foreach (var di in order.OrderIngredients)
            {
                var stored = context.Ingredient
                    .First(i => i.IngredientName.ToLower() == di.IngredientName.ToLower());
                stored.RemainingAmount -= di.Amount;
            }

            order.Status = OrderStatus.Confirmed;
            await context.SaveChangesAsync();

            var jobs = order.OrderIngredients
                .Select(di =>
                {
                    var slot = context.Ingredient
                        .First(i => i.IngredientName == di.IngredientName)
                        .PumpSlot!.Value;
                    return (slot, di.Amount);
                })
                .ToList();
            
            lock (PumpLock)
            {
                if (manager.Running) throw new InvalidOperationException();

                _ = Task.Run(async () => await manager.RunOrderAsync(jobs));
            }

            var orders = await context.Order
                .Include(o => o.OrderIngredients)
                .ToListAsync();
            await orderService.BroadcastAsync(orders);

            await tx.CommitAsync();
            return Results.Ok(durationSec);
        }
        catch (InvalidOperationException)
        {
            await tx.RollbackAsync();
            return Results.Json(new[]
            {
                new ErrorDto
                {
                    Message = "Another drink is currently mixing, please wait a few seconds.",
                    Target = string.Empty
                }
            }, statusCode: StatusCodes.Status409Conflict);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return ErrorResults.Problem("An error occurred while processing the order: " + ex.Message);
        }
    }
}