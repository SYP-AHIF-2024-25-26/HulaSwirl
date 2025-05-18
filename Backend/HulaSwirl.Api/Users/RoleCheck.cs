using HulaSwirl.Services.DataAccess;

namespace HulaSwirl.Api.Users;

public static class RoleCheck
{
    public static IResult HandleAdminCheck(AppDbContext db, HttpContext httpContext)
    {
        return Results.Ok(httpContext.User.IsInRole("Admin"));
    }

    public static IResult HandleOperatorCheck(AppDbContext db, HttpContext httpContext)
    {
        return Results.Ok(httpContext.User.IsInRole("Operator"));
    }
}