using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Http;

namespace HulaSwirl.Api.Statistics;

public static class StatisticsApi
{
    public static IEndpointRouteBuilder MapStatisticsApi(this IEndpointRouteBuilder app)
    {
        const string baseUrl = "api/v1/statistics";

        app.MapGet($"{baseUrl}/drinks", GetDrinkStatistics.Handle)
            .WithName(nameof(GetDrinkStatistics.Handle))
            .WithDescription("Get statistics per drink")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapGet($"{baseUrl}/ingredients", GetIngredientStatistics.Handle)
            .WithName(nameof(GetIngredientStatistics.Handle))
            .WithDescription("Get ingredient usage statistics")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapGet($"{baseUrl}/users", GetUserStatistics.Handle)
            .WithName(nameof(GetUserStatistics.Handle))
            .WithDescription("Get statistics per user")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapGet($"{baseUrl}/recent-orders", GetRecentOrders.Handle)
            .WithName(nameof(GetRecentOrders.Handle))
            .WithDescription("Get orders in 30 minute intervals for the last 24h")
            .WithTags("Statistics")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        return app;
    }
}
