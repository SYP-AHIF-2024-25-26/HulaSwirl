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

        // app.MapPost($"{baseUrl}/order", OrderDrink.HandleOrderDrink)
        //     .WithName(nameof(OrderDrink.HandleOrderDrink))
        //     .WithDescription("Order a drink")
        //     .Produces(StatusCodes.Status200OK);

        app.MapPost($"{baseUrl}/orderCustomDrink", OrderCustomDrink.HandleOrderCustomDrink)
            .WithName(nameof(OrderCustomDrink.HandleOrderCustomDrink))
            .WithDescription("Order custom drink")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status200OK);

        app.MapPost($"{baseUrl}/create", CreateDrink.HandleCreateDrink)
            .WithName(nameof(CreateDrink.HandleCreateDrink))
            .WithDescription("Create drink")
            .Produces(StatusCodes.Status200OK);

        app.MapDelete($"{baseUrl}/delete", DeleteDrink.HandleDeleteDrink)
            .WithName(nameof(DeleteDrink.HandleDeleteDrink))
            .WithDescription("delete drink with id")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        app.MapPatch($"{baseUrl}/update", EditDrink.HandleEditDrink)
            .WithName(nameof(EditDrink.HandleEditDrink))
            .WithDescription("Edit drink")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}