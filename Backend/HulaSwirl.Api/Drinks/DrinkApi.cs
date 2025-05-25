using HulaSwirl.Services;
using HulaSwirl.Services.Dtos;

namespace HulaSwirl.Api.Drinks;

public static class DrinkApi
{
    public static IEndpointRouteBuilder MapDrinkApis(this IEndpointRouteBuilder app)
    {
        const string baseUrl = "api/v1/drinks";

        app.MapGet($"{baseUrl}", GetAllDrinks.HandleGetAllDrinks)
            .WithName(nameof(GetAllDrinks.HandleGetAllDrinks))
            .WithDescription("Get all drinks")
            .WithTags("Drinks")
            .Produces(StatusCodes.Status200OK);

        app.MapGet($"{baseUrl}/info/{{id:int}}", GetDrinkInfo.HandleGetDrinkInfo)
            .WithName(nameof(GetDrinkInfo.HandleGetDrinkInfo))
            .WithDescription("Get info of single drink with id")
            .WithTags("Drinks")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        app.MapPost($"{baseUrl}/create", CreateDrink.HandleCreateDrink)
            .AddEndpointFilter(ValidationHelpers.GetEndpointFilter<EditDrinkDto>(ValidateEditDrinkDto))
            .WithName(nameof(CreateDrink.HandleCreateDrink))
            .WithDescription("Create drink")
            .WithTags("Drinks")
            .RequireAuthorization()
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapDelete($"{baseUrl}/delete/{{id:int}}", DeleteDrink.HandleDeleteDrink)
            .WithName(nameof(DeleteDrink.HandleDeleteDrink))
            .WithDescription("delete drink with id")
            .WithTags("Drinks")
            .RequireAuthorization()
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapPatch($"{baseUrl}/update/{{id:int}}", EditDrink.HandleEditDrink)
            .AddEndpointFilter(ValidationHelpers.GetEndpointFilter<EditDrinkDto>(ValidateEditDrinkDto))
            .WithName(nameof(EditDrink.HandleEditDrink))
            .WithDescription("Edit drink")
            .RequireAuthorization()
            .WithTags("Drinks")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return app;
    }
    
    private static Dictionary<string, string[]> ValidateEditDrinkDto(EditDrinkDto dto)
    {
        return ValidationHelpers.ValidateDrink(dto.Name, dto.DrinkIngredients);
    }
}