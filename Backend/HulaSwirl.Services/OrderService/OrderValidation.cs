using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Services.OrderService;

public static class OrderValidation
{
    public static double ML_PER_SECOND = 13.5; // Average output of a pump at 20% speed
    /// <summary>
    /// Validates a collection of <see cref="DrinkIngredientDto"/> for an order request.
    /// </summary>
    /// <param name="ingredientNames">Ingredients of the drink.</param>
    /// <param name="context">The Database connection</param>
    /// <returns>Result NotFound if an ingredient is not available or Ok</returns>
    public static async Task<IResult> ValidateRequest(IReadOnlyCollection<string> ingredientNames, AppDbContext context)
    {
        var availableIngredients = await IngredientService.GetAllAvailableIngredientsAsync(ingredientNames, context);

        var missing = ingredientNames.Except(availableIngredients.Select(i => i.IngredientName)).ToList();
        return missing.Count != 0 ? Results.BadRequest($"The following ingredients are not available: {string.Join(", ", missing)}") : Results.Ok();
    }

    /// <summary>
    /// Validates a collection of <see cref="DrinkIngredientDto"/> for an order confirmation.
    /// </summary>
    /// <param name="drinkIngredients">Ingredients of the drink.</param>
    /// <param name="context">The Database connection</param>
    /// <returns>Result NotFound if an ingredient is not available or Ok</returns>
    public static async Task<IResult> ValidateConfirmation(IReadOnlyCollection<OrderIngredient> drinkIngredients, AppDbContext context)
    {
        var ingredientNames = drinkIngredients.Select(i => i.IngredientName).ToList();
        var availableIngredients = await IngredientService.GetAllAvailableIngredientsAsync(ingredientNames, context);

        foreach (var di in drinkIngredients)
        {
            var stored = availableIngredients.First(i => i.IngredientName == di.IngredientName);
            if (stored.RemainingAmount < di.Amount)
            {
                return Results.BadRequest(
                    $"Not enough {di.IngredientName}: available {stored.RemainingAmount}ml, needed {di.Amount}ml");
            }
        }
        var durationSec = drinkIngredients.Max(i => i.Amount) / ML_PER_SECOND;
        return Results.Ok(durationSec);
    }
}