using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Users;

public static class Login
{
    public static async Task<IResult> HandleLogin(UserDto dto, AppDbContext db, JwtService jwtService)
    {
        var fieldErrors = new List<ErrorDto>();

        if (string.IsNullOrWhiteSpace(dto.Username))
            fieldErrors.Add(new ErrorDto
            {
                Message = "A username is required",
                Target = "username"
            });

        if (string.IsNullOrWhiteSpace(dto.Key))
            fieldErrors.Add(new ErrorDto
            {
                Message = "A key is required",
                Target = "key"
            });

        if (fieldErrors.Count > 0)
            return ErrorResults.BadRequest(fieldErrors.ToArray());

        var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());
        if (user == null)
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = "This user was not found",
                Target = "username"
            });

        if (!BCryptHasher.Verify(user.KeyHash, dto.Key))
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = "The key for this user is incorrect",
                Target = "key"
            });

        var token = jwtService.GenerateToken(user);
        user.LastLogin = DateTime.Now;
        db.User.Update(user);
        await db.SaveChangesAsync();
        return Results.Ok(new { user.Username, token });
    }
}