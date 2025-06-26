using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DrinkService;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HulaSwirl.Api;

public static class ValidationHelpers
{
    public static Func<EndpointFilterInvocationContext, EndpointFilterDelegate, ValueTask<object?>> GetEndpointFilter<T, TConfig>(
        Func<T, TConfig, List<ErrorDto>> validationResult)
    {
        return async (context, next) =>
        {
            var computer = context.GetArgument<T>(0);
            var config = context.GetArgument<TConfig>(1);
            var errors = validationResult(computer, config);
            if (errors.Count > 0)
            {
                return ErrorResults.BadRequest(errors.ToArray());
            }

            return await next(context);
        };
    }

    public static List<ErrorDto> ValidateDrink(string name, DrinkIngredientDto[] ingredients, IConfiguration config)
    {
        var maxPerIngredientMl = config.GetValue<int>("HulaConfig:MaxMlPerIngredient");
        var maxTotalMl = config.GetValue<int>("HulaConfig:MaxMlPerDrink");
        var maxIngredientsPerDrink = config.GetValue<int>("HulaConfig:MaxIngredientsPerDrink");
        var errors = new List<ErrorDto>();

        if (string.IsNullOrWhiteSpace(name))
        {
            errors.Add(new ErrorDto
            {
                Message = "Please provide a name for the drink",
                Target = "name"
            });
        }

        if (ingredients.Length == 0)
        {
            errors.Add(new ErrorDto
            {
                Message = "At least one ingredient is required",
                Target = "ingredients"
            });
        }

        if (ingredients.Any(i => string.IsNullOrWhiteSpace(i.IngredientName)))
        {
            errors.Add(new ErrorDto
            {
                Message = "Ingredient names must not be empty",
                Target = "ingredients"
            });
        }
        
        if (ingredients.Length > maxIngredientsPerDrink)
        {
            errors.Add(new ErrorDto
            {
                Message = $"You can only add up to {maxIngredientsPerDrink} ingredients to a drink",
                Target = "ingredients"
            });
        }
        
        var dupes = ingredients.GroupBy(d => d.IngredientName.ToLower())
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();
        if (dupes.Count != 0)
        {
            errors.AddRange(dupes.Select(d => new ErrorDto
            {
                Message = "Duplicate ingredient",
                Target = d
            }));
        }

        var ingredientErrors = ingredients
            .Where(ing => ing.Amount <= 0 || ing.Amount > maxPerIngredientMl)
            .Select(ing => new ErrorDto
            {
                Message = $"Amount must be between 1-{maxPerIngredientMl}ml",
                Target = ing.IngredientName.ToLower()
            })
            .ToArray();

        if (ingredientErrors.Length > 0)
        {
            errors.AddRange(ingredientErrors);
        }

        if (ingredients.Sum(i => i.Amount) > maxTotalMl)
        {
            errors.Add(new ErrorDto
            {
                Message = $"Your drink can't contain more than {maxTotalMl}ml",
                Target = string.Empty
            });
        }

        return errors;
    }
    
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
}