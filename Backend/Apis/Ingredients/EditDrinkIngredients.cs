using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sprache;

namespace Backend.Apis.Ingredients;

public static class EditDrinkIngredients
{
    public static async Task<IResult<string>> HandleEditDrinkIngredients([FromBody] IngredientDto ingredientDto,
        AppDbContext context)
    {
        var drink = await context.Drink.FindAsync(ingredientDto.DrinkId);
        return null;
    }

    public class IngredientDto
    {
        public required int DrinkId { get; set; }
        public required int IngredientId { get; set; }
        public required string IngredientName { get; set; }
        public required int Quantity { get; set; }
    }
}