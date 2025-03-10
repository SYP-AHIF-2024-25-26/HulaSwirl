using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class EditDrink
{
    public static async Task<IResult> HandleEditDrink([FromBody] DrinkDto drinkDto, AppDbContext context)
    {
        //map dto
        var drink = await context.Drink.FindAsync(drinkDto.ID);

        if (drink is null)
        {
            return Results.NotFound("Drink not found");
        }

        drink.Name = drinkDto.Name;
        drink.Available = drinkDto.Available;
        drink.ImgUrl = drinkDto.ImgUrl;
        drink.Toppings = drinkDto.Toppings;

        context.Drink.Add(drink);

        await context.SaveChangesAsync();

        return Results.Ok("Drink updated");
    }

    public class DrinkDto
    {
        public required int ID { get; set; }
        public required string Name { get; set; }
        public required bool Available { get; set; }
        public required string ImgUrl { get; set; }
        public required string Toppings { get; set; }
    }
}