using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetUserStatistics
{
    public static async Task<IResult> HandleGetUserStats(AppDbContext db, HttpContext http, DateTime? start, DateTime? end)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var now = DateTime.Now;
        if (!start.HasValue || !end.HasValue)
        {
            var defaultEnd = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0, DateTimeKind.Local);
            end ??= defaultEnd;
            start ??= end.Value.AddHours(-12);
        }
        var orders = await db.Order.Where(o => o.OrderDate >= start.Value && o.OrderDate <= end.Value && o.Status == OrderStatus.Confirmed).ToListAsync();
        var stats = orders
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
            .ToList();

        return Results.Ok(stats);
    }
}
