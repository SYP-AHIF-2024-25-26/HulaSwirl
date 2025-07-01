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

        var query = db.Order.AsQueryable();
        if (start.HasValue)
            query = query.Where(o => o.OrderDate >= start.Value);
        if (end.HasValue)
            query = query.Where(o => o.OrderDate <= end.Value);

        query = query.Where(o => o.Status == OrderStatus.Confirmed);

        var orders = await query.ToListAsync();
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
