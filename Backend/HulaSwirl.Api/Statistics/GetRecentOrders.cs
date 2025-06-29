using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetRecentOrders
{
    public static async Task<IResult> HandleGetRecentOrderStats(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin()) return Results.Forbid();
        
        // Time now without seconds, milliseconds, and microseconds
        var now = DateTime.Now.AddMinutes(60 - DateTime.Now.Minute);
        var start = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0, DateTimeKind.Local).AddHours(-12);
        var end = start.AddHours(12);

        var grouped = await db.Order
            .Where(o => o.OrderDate >= start && o.OrderDate <= end)
            .GroupBy(o => new {
                o.OrderDate.Year,
                o.OrderDate.Month,
                o.OrderDate.Day,
                o.OrderDate.Hour,
                Minute = o.OrderDate.Minute < 30 ? 0 : 30
            })
            .Select(g => new IntervalStatisticDto
            {
                IntervalStart = new DateTime(g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, g.Key.Minute, 0, DateTimeKind.Local),
                Count = g.Count()
            })
            .ToListAsync();

        var result = new List<IntervalStatisticDto>();
        for (var i = 0; i < 24; i++)
        {
            var intervalStart = start.AddMinutes(30 * i);
            var entry = grouped.FirstOrDefault(g => g.IntervalStart == intervalStart);
            result.Add(new IntervalStatisticDto
            {
                IntervalStart = intervalStart,
                Count = entry?.Count ?? 0
            });
        }

        return Results.Ok(result);
    }
}
