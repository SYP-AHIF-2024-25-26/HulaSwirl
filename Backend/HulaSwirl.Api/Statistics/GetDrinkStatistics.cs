using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetDrinkStatistics
{
    public static async Task<IResult> Handle(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        var stats = await db.Order
            .Include(o => o.OrderIngredients)
            .GroupBy(o => o.DrinkName)
            .Select(g => new DrinkStatisticsDto
            {
                DrinkName = g.Key,
                Count = g.Count(),
                TotalAmount = g.SelectMany(o => o.OrderIngredients).Sum(i => i.Amount)
            })
            .OrderByDescending(d => d.Count)
            .ToListAsync();

        return Results.Ok(stats);
    }
}
