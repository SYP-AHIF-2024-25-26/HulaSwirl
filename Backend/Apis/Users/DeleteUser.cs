using Backend.Services.DatabaseService;

namespace Backend.Apis.Users;

public class DeleteUser
{
    public static async Task<IResult> HandleDelete(int id, AppDbContext db)
    {
        var user = await db.User.FindAsync(id);
        if (user == null) return Results.NotFound();

        db.User.Remove(user);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}