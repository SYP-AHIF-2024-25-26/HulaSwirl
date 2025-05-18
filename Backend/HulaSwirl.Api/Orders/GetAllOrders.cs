using HulaSwirl.Services.UserServices;

namespace HulaSwirl.Api.Orders;

public static class GetAllOrders
{
    public static IResult HandleGetAllOrders(HttpContext httpContext)
    {
        if (!httpContext.IsAdmin() && !httpContext.IsOperator())
            return Results.Forbid();

        return Results.Ok(httpContext.Items["Orders"]);
    }
}