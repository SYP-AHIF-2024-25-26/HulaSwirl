using Backend.Apis.Users;
using Backend.Services.DatabaseService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class EditDrink
{
    public static async Task<IResult> HandleEditDrink(
        [FromBody] EditDrinkDto drinkDto, 
        [FromQuery] int id, 
        AppDbContext context, 
        JwtService jwtService)
    {
        if (!drinkDto.TryValidate(out var errors))
            return Results.BadRequest(new { errors });

        if (!await AuthService.ChangePermitted(drinkDto.Username, context))
            return Results.Unauthorized();

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

        if (drinkDto.DrinkIngredients.Length == 0)
            return Results.BadRequest("Please provide at least one ingredient");

        if (drinkDto.DrinkIngredients.GroupBy(ing => ing.IngredientName.ToLower()).Any(g => g.Count() > 1))
            return Results.BadRequest("Please provide unique ingredients");

        drink.Name = drinkDto.Name;
        drink.Available = drinkDto.Available;
        drink.ImgUrl = drinkDto.ImgUrl;
        drink.Toppings = drinkDto.Toppings;

        var newIngredientNames = drinkDto.DrinkIngredients
            .Select(ing => ing.IngredientName.ToLower())
            .ToList();

        var existingDrinkIngredients = drink.DrinkIngredients
            .Where(existingDI => !newIngredientNames
                .Contains(existingDI.IngredientNameFK.ToLower()))
            .ToList();

        foreach (var existingDI in existingDrinkIngredients)
            context.DrinkIngredient.Remove(existingDI);

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

            var existingDI = drink.DrinkIngredients
                .FirstOrDefault(di => di.IngredientNameFK.ToLower() == globalIng.IngredientName.ToLower());

            if (existingDI != null)
            {
                existingDI.Amount = ingDto.Amount;
            }
            else
            {
                var newDrinkIng = new DrinkIngredient(drink.Id, globalIng.IngredientName, ingDto.Amount, drink, globalIng);
                drink.DrinkIngredients.Add(newDrinkIng);
            }
        }

        await context.SaveChangesAsync();

        foreach (var ingredient in context.Ingredient)
        {
            bool isReferenced = await context.DrinkIngredient
                .AnyAsync(di => di.IngredientNameFK == ingredient.IngredientName);
            if (!isReferenced)
            {
                context.Ingredient.Remove(ingredient);
            }
        }

        await context.SaveChangesAsync();
        return Results.Ok("Drink updated");
    }
}