using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetIngredientStatistics
{
    public static async Task<IResult> Handle(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var stats = await db.Order
            .SelectMany(o => o.OrderIngredients)
            .GroupBy(i => i.IngredientName)
            .Select(g => new IngredientStatisticsDto
            {
                IngredientName = g.Key,
                UsageCount = g.Count(),
                TotalAmount = g.Sum(x => x.Amount)
            })
            .OrderByDescending(s => s.UsageCount)
            .ToListAsync();

        return Results.Ok(stats);
    }
}
