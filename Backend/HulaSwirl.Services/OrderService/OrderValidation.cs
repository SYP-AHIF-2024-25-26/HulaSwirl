using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HulaSwirl.Services.OrderService;

public static class OrderValidation
{
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
        return missing.Count != 0
            ? ErrorResults.BadRequest(new ErrorDto
                {
                    Message = $"The following ingredients are not available: {string.Join(", ", missing)}",
                    Target = string.Empty
                })
            : Results.Ok();
    }

    /// <summary>
    /// Validates a collection of <see cref="DrinkIngredientDto"/> for an order confirmation.
    /// </summary>
    /// <param name="drinkIngredients">Ingredients of the drink.</param>
    /// <param name="context">The Database connection</param>
    /// <returns>Result NotFound if an ingredient is not available or Ok</returns>
    public static async Task<IResult> ValidateConfirmation(IReadOnlyCollection<OrderIngredient> drinkIngredients, AppDbContext context, IConfiguration config)
    {
        var ingredientNames = drinkIngredients.Select(i => i.IngredientName).ToList();
        var availableIngredients = await IngredientService.GetAllAvailableIngredientsAsync(ingredientNames, context);

        if (drinkIngredients.Count > 6)
        {
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = "You can only order up to 6 ingredients at a time.",
                Target = string.Empty
            });
        }
        
        var availablePumps = config.GetValue<int>("HulaConfig:AvailablePumpCount");
        if (drinkIngredients.Count > availablePumps)
        {
            return ErrorResults.BadRequest(new ErrorDto
            {
                Message = $"You can only order up to {availablePumps} ingredients.",
                Target = string.Empty
            });
        }
        
        foreach (var di in drinkIngredients)
        {
            var stored = availableIngredients.First(i => i.IngredientName == di.IngredientName);
            if (stored.RemainingAmount < di.Amount)
            {
                return ErrorResults.BadRequest(new ErrorDto
                {
                    Message = $"Not enough {di.IngredientName}: available {stored.RemainingAmount}ml, needed {di.Amount}ml",
                    Target = di.IngredientName
                });
            }
        }
        var durationSec = drinkIngredients.Max(i => i.Amount) / config.GetValue<double>("HulaConfig:MlPerSecond");
        return Results.Ok(durationSec);
    }
}