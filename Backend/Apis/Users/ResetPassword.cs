using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Users;

public class ResetPassword
{
    public static async Task<IResult> HandleReset(int id, ResetPasswordDto dto, AppDbContext db, IOtpService otp, BCryptHasher hasher)
    {
        var user = await db.User.FindAsync(id);
        if (user == null) return Results.NotFound();
        if (!otp.ValidateOtp(id, dto.Otp))
            return Results.BadRequest("Invalid or expired OTP.");

        user.PasswordHash = hasher.Hash(dto.NewPassword);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}