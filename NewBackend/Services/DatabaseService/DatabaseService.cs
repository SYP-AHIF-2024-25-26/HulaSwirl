using Microsoft.EntityFrameworkCore;

namespace NewBackend.Services.DatabaseService;

public class DatabaseService(AppDbContext context, ILogger<DatabaseService> logger) {
    public async Task<List<Drink>> GetAllDrinks() {
        return await context.Drink.ToListAsync();
    }

    public async Task<List<Ingredient>> GetAllIngredients() {
        var ingredients = await context.Ingredient.ToListAsync();
        return ingredients.DistinctBy(ing => ing.IngredientName).ToList();
    }
}