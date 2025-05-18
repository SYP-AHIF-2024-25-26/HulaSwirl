using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;

namespace HulaSwirl.Api.Users;

public static class CreateUser
{
    public static async Task<IResult> HandleCreate(CreateUserDto dto, AppDbContext db, [FromServices] JwtService jwtService)
    {
        var result = await UserFactory.CreateUserAsync(db, dto);

        if (!result.IsSuccess)
            return Results.BadRequest(new { errors = result.Errors });

        var token = jwtService.GenerateToken(result.Value);
        return Results.Created($"/api/users/{result.Value.Username}", new { result.Value.Username, token });
    }
}
