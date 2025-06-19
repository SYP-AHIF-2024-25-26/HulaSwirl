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
                Message = "Username is required.",
                Target = "username"
            });

        if (string.IsNullOrWhiteSpace(dto.Key))
            fieldErrors.Add(new ErrorDto
            {
                Message = "Key is required.",
                Target = "key"
            });

        if (fieldErrors.Count > 0)
            return ErrorResults.BadRequest(fieldErrors.ToArray());

        var user = await db.User.FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());
        if (user == null)
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = "User not found.",
                Target = "username"
            });

        if (!BCryptHasher.Verify(user.KeyHash, dto.Key))
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = "Invalid key.",
                Target = "key"
            });

        var token = jwtService.GenerateToken(user);
        return Results.Ok(new { user.Username, token });
    }
}