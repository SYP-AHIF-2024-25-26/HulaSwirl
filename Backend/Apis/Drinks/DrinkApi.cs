using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Drinks;

public static class DrinkApi
{
    public static IEndpointRouteBuilder MapDrinkApis(this IEndpointRouteBuilder app)
    {
        const string baseUrl = "api/v1/drinks";

        app.MapGet($"{baseUrl}", GetAllDrinks.HandleGetAllDrinks)
            .WithName(nameof(GetAllDrinks.HandleGetAllDrinks))
            .WithDescription("Get all drinks")
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status200OK);

        app.MapGet($"{baseUrl}/info", GetDrinkInfo.HandleGetDrinkInfo)
            .WithName(nameof(GetDrinkInfo.HandleGetDrinkInfo))
            .WithDescription("Get info of single drink with drink_id")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        app.MapPost($"{baseUrl}/orderCustomDrink", OrderCustomDrink.HandleOrderCustomDrink)
            .WithName(nameof(OrderCustomDrink.HandleOrderCustomDrink))
            .WithDescription("Order custom drink")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status200OK);


        return app;
    }
}