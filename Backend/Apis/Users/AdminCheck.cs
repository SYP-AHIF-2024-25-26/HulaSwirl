using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class AdminCheck
{
    public static async Task<IResult> HandleRoleCheck(string jwt, AppDbContext db, HttpContext httpContext)
    {
        return !httpContext.User.IsInRole("Admin") ? Results.Forbid() : Results.Ok();
    }
}