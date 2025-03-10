using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class CreateDrink
{
    public static async Task<Drink?> HandleCreateDrink([FromBody] DrinkDto drinkDto, AppDbContext context)
    {
        //map dto
        var drink = new
            Drink(drinkDto.Name, true, drinkDto.Img, drinkDto.Toppings);

        drink.DrinkIngredients =
            drinkDto.Ingredients.Select(dto => new Ingredient(dto.Name, dto.Amount, drink)).ToList();

        context.Drink.Add(drink);

        await context.SaveChangesAsync();
        return drink;
    }

    public class DrinkDto
    {
        public required string Name { get; set; }
        public required string Img { get; set; }
        public required string Toppings { get; set; }

        public required List<IngredientDto> Ingredients { get; set; }
    }

    public class IngredientDto
    {
        public required string Name { get; set; }
        public required int Amount { get; set; }
    }
}