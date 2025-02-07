using Backend.Services.DatabaseService;
using Backend.Services.DatabaseService.Models;

namespace Backend.Apis.Drinks;

public static class GetAllDrinks {
    public static async Task<List<Drink>> HandleGetAllDrinks(DatabaseService dbService) {
        return await dbService.GetAllDrinks();
    }
}