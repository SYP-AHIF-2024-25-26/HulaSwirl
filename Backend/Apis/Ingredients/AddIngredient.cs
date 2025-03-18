using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Ingredients;

public static class AddIngredient
{
    public static async Task<IResult> HandleAddIngredient([FromBody] DrinkIngredientDto drinkIngredientDto,
        [FromQuery] int drinkId,
        AppDbContext context)
    {
        var drink = await context.Drink.FindAsync(drinkId);

        if (drink is null)
        {
            return Results.NotFound("Drink with id not found");
        }

        var newIngredient = new Ingredient()
        {
            IngredientName = drinkIngredientDto.IngredientName,
            Ml = drinkIngredientDto.Amount
        };

        drink.DrinkIngredients.Add(newIngredient);

        await context.SaveChangesAsync();

        return Results.Ok("Ingredient added to drink");
    }

    public class DrinkIngredientDto
    {
        public required string IngredientName { get; set; }
        public required int Amount { get; set; }
    }
}