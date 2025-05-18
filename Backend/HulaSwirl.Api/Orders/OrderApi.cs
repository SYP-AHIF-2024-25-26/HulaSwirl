namespace HulaSwirl.Api.Orders;

public static class OrderApi
{
    public static IEndpointRouteBuilder MapOrderApis(this IEndpointRouteBuilder app)
    {
        const string baseUrl = "api/v1/orders";

        app.MapGet($"{baseUrl}", GetAllOrders.HandleGetAllOrders)
            .WithName(nameof(GetAllOrders.HandleGetAllOrders))
            .WithDescription("Get all orders")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapPost($"{baseUrl}/new/{{drinkId}}", OrderDrink.HandleOrderDrink)
            .WithName(nameof(OrderDrink.HandleOrderDrink))
            .WithDescription("Order a drink")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status201Created);

        app.MapPost($"{baseUrl}/new/custom", OrderCustomDrink.HandleOrderCustomDrink)
            .WithName(nameof(OrderCustomDrink.HandleOrderCustomDrink))
            .WithDescription("Order custom drink")
            .WithTags("Drinks")
            .RequireAuthorization()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status201Created);
        
        app.MapPost($"{baseUrl}/confirm/{{orderId}}", ConfirmOrder.HandleConfirmOrder)
            .WithName(nameof(ConfirmOrder.HandleConfirmOrder))
            .WithDescription("Confirm order")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        
        app.MapPost($"{baseUrl}/cancel/{{orderId}}", CancelOrder.HandleCancelOrder)
            .WithName(nameof(CancelOrder.HandleCancelOrder))
            .WithDescription("Cancel order")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        
        app.MapGet($"{baseUrl}/{{orderId}}", GetOrder.HandleGetOrder)
            .WithName(nameof(GetOrder.HandleGetOrder))
            .WithDescription("Get order")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        
        app.MapGet($"{baseUrl}/history", GetOrderHistory.HandleGetOrderHistory)
            .WithName(nameof(GetOrderHistory.HandleGetOrderHistory))
            .WithDescription("Get order history")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        
        return app;
    }
}