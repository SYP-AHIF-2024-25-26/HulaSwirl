using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.UserServices;

namespace HulaSwirl.Api.Users;

public static class RoleCheck
{
    public static IResult HandleAdminCheck(AppDbContext db, HttpContext httpContext)
    {
        return Results.Ok(httpContext.IsAdmin());
    }

    public static IResult HandleOperatorCheck(AppDbContext db, HttpContext httpContext)
    {
        return Results.Ok(httpContext.IsOperator());
    }
}