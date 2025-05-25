using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.Pumps;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class OrderDrink
{
    public static async Task<IResult> HandleOrderDrink(
        [FromRoute] int drinkId, 
        AppDbContext context, 
        HttpContext httpContext,
        ObservableOrderService orderService,
        JwtService jwtService)
    {
        var drink = await context.Drink
            .Include(d => d.DrinkIngredients)
            .FirstOrDefaultAsync(d => d.Id == drinkId);

        if (drink is null) return Results.NotFound("Drink not found");

        var ingredientNames = drink.DrinkIngredients.Select(i => i.IngredientNameFk).ToList();
        var res = await OrderValidation.ValidateRequest(ingredientNames, context);
        if (res is not Ok)
            return res;
        
        var orderIngredients = drink.DrinkIngredients
            .Select(i => 
                new DrinkIngredient(
                    null, 
                    i.IngredientNameFk, 
                    i.Amount, 
                    null, 
                    null))
            .ToList();
        var username = jwtService.GetUsernameFromToken(httpContext.Request.Headers.Authorization!);
        var order = new Order(username, DateTime.Now, drink.Name, orderIngredients);
        context.Order.Add(order);
        await context.SaveChangesAsync();
        var orders = await context.Order
            .Include(o => o.DrinkIngredients)
            .ToListAsync();
        await orderService.BroadcastAsync(orders);
        return Results.Created($"/api/orders/{order.Id}", "Order created successfully");
    }
}