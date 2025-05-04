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
            .WithTags("Drinks")
            .Produces(StatusCodes.Status200OK);

        app.MapGet($"{baseUrl}/info", GetDrinkInfo.HandleGetDrinkInfo)
            .WithName(nameof(GetDrinkInfo.HandleGetDrinkInfo))
            .WithDescription("Get info of single drink with drink_id")
            .WithTags("Drinks")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        app.MapPost($"{baseUrl}/order", OrderDrink.HandleOrderDrink)
            .WithName(nameof(OrderDrink.HandleOrderDrink))
            .WithDescription("Order a drink")
            .WithTags("Drinks")
            .RequireAuthorization()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status200OK);

        app.MapPost($"{baseUrl}/orderCustomDrink", OrderCustomDrink.HandleOrderCustomDrink)
            .WithName(nameof(OrderCustomDrink.HandleOrderCustomDrink))
            .WithDescription("Order custom drink")
            .WithTags("Drinks")
            .RequireAuthorization()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status200OK);

        app.MapPost($"{baseUrl}/create", CreateDrink.HandleCreateDrink)
            .WithName(nameof(CreateDrink.HandleCreateDrink))
            .WithDescription("Create drink")
            .WithTags("Drinks")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapDelete($"{baseUrl}/delete", DeleteDrink.HandleDeleteDrink)
            .WithName(nameof(DeleteDrink.HandleDeleteDrink))
            .WithDescription("delete drink with id")
            .WithTags("Drinks")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapPatch($"{baseUrl}/update", EditDrink.HandleEditDrink)
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
}