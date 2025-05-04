using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class AdminCheck
{
    public static async Task<IResult> HandleRoleCheck(AppDbContext db, HttpContext httpContext)
    {
        return Results.Ok(httpContext.User.IsInRole("Admin"));
    }
}