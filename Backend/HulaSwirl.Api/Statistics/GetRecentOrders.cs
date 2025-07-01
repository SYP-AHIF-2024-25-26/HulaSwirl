using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.OrderService;
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
            var defaultEnd = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0, DateTimeKind.Local);
            end ??= defaultEnd;
            start ??= end.Value.AddHours(-12);
        }
        var stepMinutes = GetStepMinutes(start.Value, end.Value);
        end = end.Value.AddMinutes(stepMinutes - end.Value.Minute % stepMinutes);
        start = start.Value.AddMinutes(-start.Value.Minute % stepMinutes);

        var grouped = await db.Order
            .Where(o => o.OrderDate >= start && o.OrderDate <= end && o.Status == OrderStatus.Confirmed)
            .GroupBy(o => new {
                o.OrderDate.Year,
                o.OrderDate.Month,
                o.OrderDate.Day,
                o.OrderDate.Hour,
                Minute = o.OrderDate.Minute / stepMinutes * stepMinutes
            })
            .Select(g => new IntervalStatisticDto
            {
                IntervalStart = new DateTime(g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, g.Key.Minute, 0, DateTimeKind.Local),
                Count = g.Count()
            })
            .ToListAsync();

        var step = TimeSpan.FromMinutes(stepMinutes);

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
    
    private static int GetStepMinutes(DateTime start, DateTime end)
    {
        return (end - start).TotalHours switch
        {
            <= 6 => 15,
            <= 12 => 30,
            _ => 60
        };
    }
}
