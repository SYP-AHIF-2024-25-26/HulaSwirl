using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;

namespace HulaSwirl.Api.Users;

public static class DeleteUser
{
    public static async Task<IResult> HandleDelete(
        [FromRoute] string username,
        AppDbContext db,
        [FromBody] DeleteUserDto dto,
        IOtpService otp)
    {
        if (!dto.TryValidate(out var errors))
            return Results.BadRequest(errors);

        var user = await db.User.FindAsync(username);
        if (user == null)
            return Results.NotFound("User not found.");

        if (!otp.UseOtp(username, dto.Otp))
            return Results.BadRequest("Invalid or expired OTP.");

        db.User.Remove(user);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
