using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;

namespace HulaSwirl.Api.Users;

public static class CreateUser
{
    public static async Task<IResult> HandleCreate(CreateUserDto dto, AppDbContext db, [FromServices] JwtService jwtService)
    {
        return await UserFactory.CreateUserAsync(db, dto, jwtService);
    }
}
