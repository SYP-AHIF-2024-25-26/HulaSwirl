using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetIngredientStatistics
{
    public static async Task<IResult> HandleGetIngredientStats(AppDbContext db, HttpContext http, DateTime? start, DateTime? end)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var query = db.Order.AsQueryable();
        if (start.HasValue)
            query = query.Where(o => o.OrderDate >= start.Value);
        if (end.HasValue)
            query = query.Where(o => o.OrderDate <= end.Value);

        var orders = await query.ToListAsync();
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
