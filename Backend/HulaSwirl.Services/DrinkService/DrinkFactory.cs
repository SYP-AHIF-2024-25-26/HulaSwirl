using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;

namespace HulaSwirl.Services.DrinkService;

/// <summary>
/// Handles creation and update operations for drinks, decoupled from HTTP concerns.
/// </summary>
public static class DrinkFactory
{
    /// <summary>
    /// Creates a new drink based on the provided DTO.
    /// </summary>
    public static async Task<Result<Drink>> CreateDrinkAsync(AppDbContext context, EditDrinkDto dto)
    {
        if (!DrinkIngredientValidation.Validate(dto.DrinkIngredients, out var errors))
            return Result<Drink>.Failure(errors);

        var drink = new Drink(dto.Name, dto.Available, dto.ImgUrl, dto.Toppings, []);

        foreach (var ingDto in dto.DrinkIngredients)
        {
            var globalIng = await IngredientService.EnsureIngredientExistsAsync(context, ingDto.IngredientName);
            drink.DrinkIngredients.Add(new DrinkIngredient(drink.Id, globalIng.IngredientName, ingDto.Amount, drink,
                globalIng));
        }

        context.Drink.Add(drink);
        await context.SaveChangesAsync();

        return Result<Drink>.Success(drink);
    }

    /// <summary>
    /// Updates an existing drink instance with values from the DTO.
    /// </summary>
    public static async Task<Result<Drink>> UpdateDrinkAsync(AppDbContext context, Drink drink, EditDrinkDto dto)
    {
        if (!DrinkIngredientValidation.Validate(dto.DrinkIngredients, out var errors))
            return Result<Drink>.Failure(errors);

        drink.Name = dto.Name;
        drink.Available = dto.Available;
        drink.ImgUrl = dto.ImgUrl;
        drink.Toppings = dto.Toppings;

        var newNamesSet = dto.DrinkIngredients.Select(i => i.IngredientName.ToLower()).ToHashSet();

        // Remove old ingredients
        var toRemove = drink.DrinkIngredients
            .Where(di => !newNamesSet.Contains(di.IngredientNameFk.ToLower()))
            .ToList();
        context.DrinkIngredient.RemoveRange(toRemove);

        // Add or update ingredients
        foreach (var ingDto in dto.DrinkIngredients)
        {
            var globalIng = await IngredientService.EnsureIngredientExistsAsync(context, ingDto.IngredientName);

            var existing = drink.DrinkIngredients.FirstOrDefault(di =>
                di.IngredientNameFk.ToLower() == globalIng.IngredientName.ToLower());

            if (existing != null)
                existing.Amount = ingDto.Amount;
            else
                drink.DrinkIngredients.Add(
                    new DrinkIngredient(drink.Id, globalIng.IngredientName, ingDto.Amount, drink, globalIng));
        }

        await context.SaveChangesAsync();
        await IngredientService.RemoveUnreferencedIngredientsAsync(context);

        return Result<Drink>.Success(drink);
    }
}
