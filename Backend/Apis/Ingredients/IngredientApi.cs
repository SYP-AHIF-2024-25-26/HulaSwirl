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

        app.MapPatch($"{baseUrl}/edit", EditIngredient.HandleEditIngredientsInBottle)
            .WithName(nameof(EditIngredient.HandleEditIngredientsInBottle))
            .WithDescription("Edit ingredient")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        app.MapPatch($"{baseUrl}/inBottle/edit", EditIngredient.HandleEditIngredientsInBottle)
            .WithName(nameof(EditIngredient.HandleEditIngredientsInBottle))
            .WithDescription("Edit ingredients in bottle")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        return app;
    }
}