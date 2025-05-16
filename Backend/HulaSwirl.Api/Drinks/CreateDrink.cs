using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Drinks;

public static class CreateDrink
{
    public static async Task<IResult> HandleCreateDrink(
        [FromBody] EditDrinkDto drinkDto,
        AppDbContext context,
        HttpContext httpContext)
    {
        if (!drinkDto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });

        if (!httpContext.User.IsInRole("Admin"))
            return Results.Forbid();

        if (drinkDto.DrinkIngredients.Length == 0)
            return Results.BadRequest("Please provide at least one ingredient");

        if (drinkDto.DrinkIngredients.GroupBy(ing => ing.IngredientName.ToLower()).Any(g => g.Count() > 1))
            return Results.BadRequest("Please provide unique ingredients");

        foreach (var ing in drinkDto.DrinkIngredients)
        {
            if (ing.Amount is <= 0 or > 500)
                return Results.BadRequest($"Invalid amount for ingredient '{ing.IngredientName}': {ing.Amount}ml (allowed: 1–500)");
        }

        if (drinkDto.DrinkIngredients.Sum(di => di.Amount) > 500)
            return Results.BadRequest("Your drink can't contain more than 500ml");

        var drink = new Drink(
            drinkDto.Name,
            drinkDto.Available,
            drinkDto.ImgUrl,
            drinkDto.Toppings,
            []
        );

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

            var drinkIng = new DrinkIngredient(
                drink.Id,
                globalIng.IngredientName,
                ingDto.Amount,
                drink,
                globalIng
            );

            drink.DrinkIngredients.Add(drinkIng);
        }

        context.Drink.Add(drink);
        await context.SaveChangesAsync();

        return Results.Ok("Drink created");
    }
}