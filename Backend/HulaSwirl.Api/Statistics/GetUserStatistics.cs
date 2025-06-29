using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetUserStatistics
{
    public static async Task<IResult> Handle(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var stats = await db.Order
            .GroupBy(o => o.User)
            .Select(g => new UserStatisticsDto
            {
                User = g.Key,
                TotalOrders = g.Count(),
                Drinks = g.GroupBy(o => o.DrinkName)
                    .Select(d => new UserDrinkCountDto { DrinkName = d.Key, Count = d.Count() })
                    .OrderByDescending(d => d.Count)
                    .ToList()
            })
            .OrderByDescending(u => u.TotalOrders)
            .ToListAsync();

        return Results.Ok(stats);
    }
}
