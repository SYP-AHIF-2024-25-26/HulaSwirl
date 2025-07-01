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

        var query = db.Order
            .Include(o => o.OrderIngredients)
            .AsQueryable();

        if (start.HasValue)
            query = query.Where(o => o.OrderDate >= start.Value);

        if (end.HasValue)
            query = query.Where(o => o.OrderDate <= end.Value);
        
        query = query.Where(o => o.Status == OrderStatus.Confirmed);

        var orders = await query.ToListAsync();

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
