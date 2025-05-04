using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class AdminCheck
{
    public static async Task<IResult> HandleRoleCheck(string username, AppDbContext db)
    {
        var user = await db.User.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return Results.NotFound();

        return Results.Ok(AuthService.IsAdmin(user));
    }
}