using Backend.Services.DatabaseService;

namespace Backend.Apis.Users;

public class RequestOtp
{
    public static async Task<IResult> HandleRequestOtp(int id, AppDbContext db, IOtpService otp)
    {
        var user = await db.User.FindAsync(id);
        if (user == null) return Results.NotFound();

        var code = otp.GenerateOtp(id);
        return Results.Ok(new { otp = code, expiresIn = otp.ValidityMinutes });
    }
}