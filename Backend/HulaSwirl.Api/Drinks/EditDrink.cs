using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Drinks;

public static class EditDrink
{
    public static async Task<IResult> HandleEditDrink(
        [FromBody] EditDrinkDto drinkDto,
        [FromQuery] int id,
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

        var drink = await context.Drink
            .Include(d => d.DrinkIngredients)
            .ThenInclude(di => di.Ingredient)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (drink is null)
            return Results.NotFound("Drink not found");

        drink.Name = drinkDto.Name;
        drink.Available = drinkDto.Available;
        drink.ImgUrl = drinkDto.ImgUrl;
        drink.Toppings = drinkDto.Toppings;

        var newIngredientNames = drinkDto.DrinkIngredients
            .Select(ing => ing.IngredientName.ToLower())
            .ToHashSet();

        var toRemove = drink.DrinkIngredients
            .Where(di => !newIngredientNames.Contains(di.IngredientNameFk.ToLower()))
            .ToList();

        context.DrinkIngredient.RemoveRange(toRemove);

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

            var existingDi = drink.DrinkIngredients
                .FirstOrDefault(di => di.IngredientNameFk.ToLower() == globalIng.IngredientName.ToLower());

            if (existingDi != null)
            {
                existingDi.Amount = ingDto.Amount;
            }
            else
            {
                var newDrinkIng = new DrinkIngredient(drink.Id, globalIng.IngredientName, ingDto.Amount, drink, globalIng);
                drink.DrinkIngredients.Add(newDrinkIng);
            }
        }

        await context.SaveChangesAsync();

        var unreferencedIngredients = await context.Ingredient
            .Where(i => !context.DrinkIngredient.Any(di => di.IngredientNameFk == i.IngredientName))
            .ToListAsync();

        context.Ingredient.RemoveRange(unreferencedIngredients);

        await context.SaveChangesAsync();

        return Results.Ok("Drink updated");
    }
}