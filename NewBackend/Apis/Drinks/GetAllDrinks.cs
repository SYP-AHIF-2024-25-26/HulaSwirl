using NewBackend.Services.DatabaseService;

namespace NewBackend.Apis.Drinks;

public static class GetAllDrinks {
    public static async Task<List<Drink>> HandleGetAllDrinks(DatabaseService dbService) {
        return await dbService.GetAllDrinks();
    }
}