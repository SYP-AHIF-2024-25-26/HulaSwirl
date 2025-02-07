using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Drinks;

public static class DrinkApi {
    public static IEndpointRouteBuilder MapDrinkApis(this IEndpointRouteBuilder app) {
        const string baseUrl = "api/v1/drinks";

        app.MapGet($"{baseUrl}", GetAllDrinks.HandleGetAllDrinks)
            .WithName(nameof(GetAllDrinks.HandleGetAllDrinks))
            .WithDescription("Get all drinks")
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status200OK);

        return app;
    }
}