using HulaSwirl.Services.Dtos;

namespace HulaSwirl.Api.Orders;

public static class OrderApi
{
    public static IEndpointRouteBuilder MapOrderApis(this IEndpointRouteBuilder app)
    {
        const string baseUrl = "api/v1/orders";

        app.Map("ws/orders", GetAllOrders.HandleGetAllOrders);

        app.MapPost($"{baseUrl}/drink/{{drinkId}}", OrderDrink.HandleOrderDrink)
            .WithName(nameof(OrderDrink.HandleOrderDrink))
            .WithDescription("Order a drink")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status201Created);

        app.MapPost($"{baseUrl}/custom-drink", OrderCustomDrink.HandleOrderCustomDrink)
            .AddEndpointFilter(ValidationHelpers.GetEndpointFilter<DrinkIngredientDto[]>(ValidateCustomOrder))
            .WithName(nameof(OrderCustomDrink.HandleOrderCustomDrink))
            .WithDescription("Order custom drink")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status201Created);
        
        app.MapPut($"{baseUrl}/confirm/{{orderId:int}}", ConfirmOrder.HandleConfirmOrder)
            .WithName(nameof(ConfirmOrder.HandleConfirmOrder))
            .WithDescription("Confirm order")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        
        app.MapPut($"{baseUrl}/cancel/{{orderId:int}}", CancelOrder.HandleCancelOrder)
            .WithName(nameof(CancelOrder.HandleCancelOrder))
            .WithDescription("Cancel order")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        
        app.MapGet($"{baseUrl}/{{orderId:int}}", GetOrder.HandleGetOrder)
            .WithName(nameof(GetOrder.HandleGetOrder))
            .WithDescription("Get order")
            .WithTags("Orders")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        
        return app;
    }
    
    private static List<string> ValidateCustomOrder(DrinkIngredientDto[] ingredients)
    {
        return ValidationHelpers.ValidateDrink("Custom drink", ingredients);
    }
}