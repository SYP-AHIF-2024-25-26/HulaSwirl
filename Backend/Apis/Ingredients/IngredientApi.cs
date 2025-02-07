using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class IngredientApi {
    public static IEndpointRouteBuilder MapIngredientApis(this IEndpointRouteBuilder app) {
        const string baseUrl = "api/v1/ingredients";

        app.MapGet($"{baseUrl}", GetAllIngredients.HandleGetAllIngredients)
            .WithName(nameof(GetAllIngredients.HandleGetAllIngredients))
            .WithDescription("Get all ingredients")
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status200OK);

        return app;
    }
}

