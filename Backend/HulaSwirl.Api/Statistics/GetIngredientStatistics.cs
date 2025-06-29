using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetIngredientStatistics
{
    public static async Task<IResult> HandleGetIngredientStats(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var orders = await db.Order.ToListAsync();
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
