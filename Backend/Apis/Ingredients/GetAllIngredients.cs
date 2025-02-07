using Backend.Services.DatabaseService;

namespace Backend.Apis.Ingredients;

public static class GetAllIngredients {
    public static async Task<List<IngredientDto>> HandleGetAllIngredients(DatabaseService dbService) {
        return (await dbService.GetAllIngredients())
            .Select(ing => new IngredientDto
                { IngredientName = ing.IngredientName })
            .ToList();
    }
    public class IngredientDto {
        public required string IngredientName { get; set; }
    }
}

