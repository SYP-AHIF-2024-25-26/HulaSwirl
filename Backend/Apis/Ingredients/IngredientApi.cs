using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Ingredients;

public static class IngredientApi
{
    public static IEndpointRouteBuilder MapIngredientApis(this IEndpointRouteBuilder app)
    {
        const string baseUrl = "api/v1/ingredients";

        app.MapGet($"{baseUrl}", GetAllIngredients.HandleGetAllIngredients)
            .WithName(nameof(GetAllIngredients.HandleGetAllIngredients))
            .WithDescription("Get all ingredients")
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status200OK);

        app.MapGet($"{baseUrl}/inBottle", GetIngredientsInBottle.HandleGetIngredientsInBottle)
            .WithName(nameof(GetIngredientsInBottle.HandleGetIngredientsInBottle))
            .WithDescription("Get all ingredients in bottle")
            .Produces(StatusCodes.Status200OK);

        app.MapPatch($"{baseUrl}/edit", EditIngredient.HandleEditIngredient)
            .WithName(nameof(EditIngredient.HandleEditIngredient))
            .WithDescription("Edit ingredient")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        app.MapPatch($"{baseUrl}/inBottle/edit", EditIngredientInBottle.HandleEditIngredientInBottle)
            .WithName(nameof(EditIngredientInBottle.HandleEditIngredientInBottle))
            .WithDescription("Edit ingredients in bottle")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        return app;
    }
}