using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.OrderService;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetIngredientStatistics
{
    public static async Task<IResult> HandleGetIngredientStats(AppDbContext db, HttpContext http, DateTime? start, DateTime? end)
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
            .SelectMany(o => o.OrderIngredients)
            .GroupBy(i => i.IngredientName)
            .Select(g => new IngredientStatisticsDto
            {
                IngredientName = g.Key,
                UsageCount = g.Count(),
                TotalAmount = g.Sum(x => x.Amount)
            })
            .OrderByDescending(s => s.UsageCount)
            .ToList();

        return Results.Ok(stats);
    }
}
