using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetRecentOrders
{
    public static async Task<IResult> Handle(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var now = DateTime.UtcNow;
        var start = now.AddHours(-24);

        var grouped = await db.Order
            .Where(o => o.OrderDate >= start && o.OrderDate <= now)
            .GroupBy(o => new {
                o.OrderDate.Year,
                o.OrderDate.Month,
                o.OrderDate.Day,
                Hour = o.OrderDate.Hour,
                Minute = o.OrderDate.Minute < 30 ? 0 : 30
            })
            .Select(g => new IntervalStatisticDto
            {
                IntervalStart = new DateTime(g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, g.Key.Minute, 0, DateTimeKind.Utc),
                Count = g.Count()
            })
            .ToListAsync();

        var result = new List<IntervalStatisticDto>();
        for (var i = 0; i < 48; i++)
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
