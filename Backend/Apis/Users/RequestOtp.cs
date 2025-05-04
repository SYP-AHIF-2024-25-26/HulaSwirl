using Backend.Services.DatabaseService;

namespace Backend.Apis.Users;

public class RequestOtp
{
    public static async Task<IResult> HandleRequestOtp(string username, AppDbContext db, IOtpService otp)
    {
        var user = await db.User.FindAsync(username);
        if (user == null) return Results.NotFound();

        var email = user.Email;
        var code = otp.GenerateOtp(username);
        
        return Results.Ok( new { Code = code, Email = email } );
    }
}