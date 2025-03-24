using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class CreateDrink
{
    public static async Task<IResult> HandleCreateDrink([FromBody] DrinkDto drinkDto, AppDbContext context)
    {
        if (drinkDto.DrinkIngredients.Length == 0)
        {
            return Results.BadRequest("Please provide at least one ingredient");
        }
        if (drinkDto.DrinkIngredients.GroupBy(ing => ing.IngredientName.ToLower()).Any(g => g.Count() > 1))
        {
            return Results.BadRequest("Please provide unique ingredients");
        }

        var drink = new Drink(drinkDto.Name, drinkDto.Available, drinkDto.ImgUrl, drinkDto.Toppings);

        foreach (var ingDto in drinkDto.DrinkIngredients)
        {
            var globalIng = await context.Ingredient
                .FirstOrDefaultAsync(i => i.IngredientName.ToLower() == ingDto.IngredientName.ToLower());

            if (globalIng == null)
            {
                globalIng = new Ingredient(ingDto.IngredientName, 0, 0);
                context.Ingredient.Add(globalIng);
                await context.SaveChangesAsync();
            }

            var drinkIng = new DrinkIngredient(drink.Id, globalIng.IngredientName, ingDto.Amount, drink, globalIng);
            drink.DrinkIngredients.Add(drinkIng);
        }

        context.Drink.Add(drink);
        await context.SaveChangesAsync();
        return Results.Ok("Drink created");
    }

    public class DrinkDto
    {
        public required string Name { get; set; }
        public required bool Available { get; set; }
        public required string ImgUrl { get; set; }
        public required string Toppings { get; set; }
        
        public required IngredientDto[] DrinkIngredients { get; set; }
    }

    public class IngredientDto
    {
        public required string IngredientName { get; set; }
        public required int Amount { get; set; }
    }
}