using Microsoft.EntityFrameworkCore;

namespace NewBackend.Services.DatabaseService;

public class DatabaseService(AppDbContext context, ILogger<DatabaseService> logger) {
    public async Task<List<Drink>> GetAllDrinks() {
        return await context.Drink.ToListAsync();
    }

}