using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Statistics;

public static class GetDrinkStatistics
{
    public static async Task<IResult> HandleGetDrinkStats(AppDbContext db, HttpContext http)
    {
        if (!http.IsAdmin()) return Results.Forbid();

        // Step 1: Fetch required data from DB
        var orders = await db.Order
            .Include(o => o.OrderIngredients)
            .ToListAsync();

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
