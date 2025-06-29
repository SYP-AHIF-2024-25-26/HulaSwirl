using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Http;

namespace HulaSwirl.Api.Statistics;

public static class StatisticsApi
{
    public static IEndpointRouteBuilder MapStatisticsApi(this IEndpointRouteBuilder app)
    {
        const string baseUrl = "api/v1/statistics";

        app.MapGet($"{baseUrl}/drinks", GetDrinkStatistics.HandleGetDrinkStats)
            .WithName(nameof(GetDrinkStatistics.HandleGetDrinkStats))
            .WithDescription("Get statistics per drink")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapGet($"{baseUrl}/ingredients", GetIngredientStatistics.HandleGetIngredientStats)
            .WithName(nameof(GetIngredientStatistics.HandleGetIngredientStats))
            .WithDescription("Get ingredient usage statistics")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapGet($"{baseUrl}/users", GetUserStatistics.HandleGetUserStats)
            .WithName(nameof(GetUserStatistics.HandleGetUserStats))
            .WithDescription("Get statistics per user")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapGet($"{baseUrl}/recent-orders", GetRecentOrders.HandleGetRecentOrderStats)
            .WithName(nameof(GetRecentOrders.HandleGetRecentOrderStats))
            .WithDescription("Get orders in 30 minute intervals for the last 24h")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        return app;
    }
}
