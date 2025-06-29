using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetRecentOrders
{
    public static async Task<IResult> HandleGetRecentOrderStats(AppDbContext db, HttpContext http, DateTime? start, DateTime? end)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var now = DateTime.Now;
        if (!start.HasValue || !end.HasValue)
        {
            var defaultEnd = new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0, DateTimeKind.Local);
            end ??= defaultEnd;
            start ??= end.Value.AddHours(-12);
        }

        var grouped = await db.Order
            .Where(o => o.OrderDate >= start && o.OrderDate <= end)
            .GroupBy(o => new {
                o.OrderDate.Year,
                o.OrderDate.Month,
                o.OrderDate.Day,
                o.OrderDate.Hour,
                Minute = (end.Value - start.Value).TotalHours <= 6
                    ? (o.OrderDate.Minute < 15 ? 0 : o.OrderDate.Minute < 30 ? 15 : o.OrderDate.Minute < 45 ? 30 : 45)
                    : (end.Value - start.Value).TotalHours <= 12
                        ? (o.OrderDate.Minute < 30 ? 0 : 30)
                        : 0
            })
            .Select(g => new IntervalStatisticDto
            {
                IntervalStart = new DateTime(g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, g.Key.Minute, 0, DateTimeKind.Local),
                Count = g.Count()
            })
            .ToListAsync();

        var step = (end.Value - start.Value).TotalHours <= 6
            ? TimeSpan.FromMinutes(15)
            : (end.Value - start.Value).TotalHours <= 12
                ? TimeSpan.FromMinutes(30)
                : TimeSpan.FromHours(1);

        var result = new List<IntervalStatisticDto>();
        for (var t = start.Value; t < end.Value; t += step)
        {
            var entry = grouped.FirstOrDefault(g => g.IntervalStart == t);
            result.Add(new IntervalStatisticDto
            {
                IntervalStart = t,
                Count = entry?.Count ?? 0
            });
        }

        return Results.Ok(result);
    }
}
