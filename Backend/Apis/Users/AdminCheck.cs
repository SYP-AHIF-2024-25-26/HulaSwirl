using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Users;

public class AdminCheck
{
    public static async Task<IResult> HandleRoleCheck(string username, AppDbContext db)
    {
        var user = await db.User.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return Results.NotFound();

        var isAdmin = user.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        return Results.Ok(new { isAdmin });
    }
}