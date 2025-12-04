using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetDrinkStatistics
{
    public static async Task<IResult> HandleGetDrinkStats(AppDbContext db, HttpContext http, DateTime? start, DateTime? end)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var now = DateTime.Now;
        if (!start.HasValue || !end.HasValue)
        {
            var defaultEnd = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0, DateTimeKind.Local);
            end ??= defaultEnd;
            start ??= end.Value.AddHours(-12);
        }
        var orders = await db.Order.Include(o => o.OrderIngredients).Where(o => o.OrderDate >= start.Value && o.OrderDate <= end.Value && o.Status == OrderStatus.Confirmed).ToListAsync();

        // Step 2: Group and aggregate in memory
        var stats = orders
            .GroupBy(o => o.DrinkName)
            .Select(g => new DrinkStatisticsDto
            {
                DrinkName = g.Key,
                Count = g.Count(),
                TotalAmount = g.SelectMany(o => o.OrderIngredients).Sum(o => o.Amount)
            })
            .OrderByDescending(d => d.Count)
            .ToList();

        return Results.Ok(stats);
    }
}
