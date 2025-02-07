using Backend.Services.DatabaseService.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.DatabaseService;

public class DatabaseService(AppDbContext context, ILogger<DatabaseService> logger) {
    public async Task<List<Drink>> GetAllDrinks() {
        return await context.Drink.ToListAsync();
    }

    public async Task<List<Ingredient>> GetAllIngredients() {
        var ingredients = await context.Ingredient.ToListAsync();
        return ingredients.DistinctBy(ing => ing.IngredientName).ToList();
    }

    public async Task<IEnumerable<IngredientInBottle>> GetAllAvailableIngredients() {
        return (await context.IngredientInBottle.Include(ing => ing.Pump).ToListAsync())
            .Where(ing => ing.Pump is not null);
    }
}