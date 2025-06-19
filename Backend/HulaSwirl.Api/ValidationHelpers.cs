using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http;

namespace HulaSwirl.Api;

public static class ValidationHelpers
{
    public static Func<EndpointFilterInvocationContext, EndpointFilterDelegate, ValueTask<object?>> GetEndpointFilter<T>(
        Func<T, List<ErrorDto>> validationResult)
    {
        return async (context, next) =>
        {
            var computer = context.GetArgument<T>(0);
            var errors = validationResult(computer);
            if (errors.Count > 0)
            {
                return ErrorResults.BadRequest(errors.ToArray());
            }

            return await next(context);
        };
    }

    public static List<ErrorDto> ValidateDrink(string name, DrinkIngredientDto[] ingredients)
    {
        const int maxPerIngredientMl = 500;
        const int maxTotalMl = 500;
        var errors = new List<ErrorDto>();

        if (string.IsNullOrWhiteSpace(name))
        {
            errors.Add(new ErrorDto
            {
                Message = "Name is required.",
                Target = "name"
            });
        }

        if (ingredients.Length == 0)
        {
            errors.Add(new ErrorDto
            {
                Message = "At least one ingredient is required.",
                Target = string.Empty
            });
        }

        if (ingredients.Any(i => string.IsNullOrWhiteSpace(i.IngredientName)))
        {
            errors.Add(new ErrorDto
            {
                Message = "Ingredient names must not be empty.",
                Target = "ingredientName"
            });
        }

        if (ingredients.GroupBy(i => i.IngredientName.ToLower()).Any(g => g.Count() > 1))
        {
            errors.Add(new ErrorDto
            {
                Message = "Please provide unique ingredients",
                Target = "ingredientName"
            });
        }

        var ingredientErrors = ingredients
            .Where(ing => ing.Amount <= 0 || ing.Amount > maxPerIngredientMl)
            .Select(ing => new ErrorDto
            {
                Message = $"Invalid amount for ingredient '{ing.IngredientName}': {ing.Amount}ml (allowed: 1–{maxPerIngredientMl})",
                Target = ing.IngredientName
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
}