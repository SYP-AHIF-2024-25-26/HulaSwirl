using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class AdminCheck
{
    public static async Task<IResult> HandleRoleCheck(string jwt, AppDbContext db, [FromServices] JwtService jwtService)
    {
        return Results.Ok(jwtService.IsAdmin(jwt));
    }
}