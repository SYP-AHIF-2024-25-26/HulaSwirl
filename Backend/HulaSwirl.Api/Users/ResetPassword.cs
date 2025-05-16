using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;

namespace HulaSwirl.Api.Users;

public class ResetPassword
{
    public static async Task<IResult> HandleReset(string username, ResetPasswordDto dto, AppDbContext db, IOtpService otp)
    {
        if (!dto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });
        var user = await db.User.FindAsync(username);
        if (user == null) return Results.NotFound();
        if (!otp.UseOtp(username, dto.Otp))
            return Results.BadRequest("Invalid or expired OTP.");

        user.PasswordHash = BCryptHasher.Hash(dto.NewPassword);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}