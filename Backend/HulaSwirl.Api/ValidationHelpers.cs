using HulaSwirl.Services.Dtos;

namespace HulaSwirl.Api;

public static class ValidationHelpers
{
    public static Func<EndpointFilterInvocationContext, EndpointFilterDelegate, ValueTask<object?>> GetEndpointFilter<T>(
        Func<T, Dictionary<string, string[]>> validationResult)
    {
        return async (context, next) =>
        {
            var computer = context.GetArgument<T>(0);
            var errors = validationResult(computer);
            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            return await next(context);
        };
    }

    public static Dictionary<string, string[]> ValidateDrink(string name, DrinkIngredientDto[] ingredients)
    {
        const int maxPerIngredientMl = 500;
        const int maxTotalMl = 500;
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(name))
        {
            errors.Add(nameof(name), ["Name is required."]);
        }

        if (ingredients.Length == 0)
        {
            errors.Add(nameof(ingredients), ["At least one ingredient is required."]);
        }

        if (ingredients.Any(i => string.IsNullOrWhiteSpace(i.IngredientName)))
        {
            errors.Add(nameof(ingredients), ["Ingredient names must not be empty."]);
        }

        if (ingredients.GroupBy(i => i.IngredientName.ToLower()).Any(g => g.Count() > 1))
        {
            errors.Add(nameof(ingredients), ["Please provide unique ingredients"]);
        }

        var ingredientErrors = ingredients
            .Where(ing => ing.Amount <= 0 || ing.Amount > maxPerIngredientMl)
            .Select(ing =>
                $"Invalid amount for ingredient '{ing.IngredientName}': {ing.Amount}ml (allowed: 1–{maxPerIngredientMl})"
            )
            .ToArray();

        if (ingredientErrors.Length > 0)
        {
            errors.Add(nameof(ingredients), ingredientErrors);
        }

        if (ingredients.Sum(i => i.Amount) > maxTotalMl)
        {
            errors.Add(nameof(ingredients), [$"Your drink can't contain more than {maxTotalMl}ml"]);
        }

        return errors;
    }
}