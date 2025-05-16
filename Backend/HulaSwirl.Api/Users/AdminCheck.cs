using HulaSwirl.Services.DataAccess;

namespace HulaSwirl.Api.Users;

public class AdminCheck
{
    public static IResult HandleRoleCheck(AppDbContext db, HttpContext httpContext)
    {
        return Results.Ok(httpContext.User.IsInRole("Admin"));
    }
}