using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Users;

public class ResetPassword
{
    public static async Task<IResult> HandleReset(string username, ResetPasswordDto dto, AppDbContext db, IOtpService otp, BCryptHasher hasher)
    {
        if (!dto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });
        var user = await db.User.FindAsync(username);
        if (user == null) return Results.NotFound();
        if (!otp.UseOtp(username, dto.Otp))
            return Results.BadRequest("Invalid or expired OTP.");

        user.PasswordHash = hasher.Hash(dto.NewPassword);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}