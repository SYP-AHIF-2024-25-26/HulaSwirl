using HulaSwirl.Services.Dtos;

namespace HulaSwirl.Services.DrinkService;

/// <summary>
/// Centralised validation logic for drink ingredients. 
/// Ensures uniqueness, enforces amount constraints and validates total volume.
/// </summary>
public static class DrinkIngredientValidation
{
    private const int MaxPerIngredientMl = 500;
    private const int MaxTotalMl = 500;

    /// <summary>
    /// Validates a collection of <see cref="DrinkIngredientDto"/>.
    /// </summary>
    /// <param name="ingredients">Ingredients of the drink.</param>
    /// <param name="errors">Populated with validation errors (if any).</param>
    /// <returns>True if validation passes, otherwise false.</returns>
    public static bool Validate(IReadOnlyCollection<DrinkIngredientDto> ingredients, out List<string> errors)
    {
        errors = [];

        if (ingredients.Count == 0)
        {
            errors.Add("Please provide at least one ingredient");
            return false;
        }

        if (ingredients.GroupBy(i => i.IngredientName.ToLower()).Any(g => g.Count() > 1))
        {
            errors.Add("Please provide unique ingredients");
        }

        errors.AddRange(from ing in ingredients where ing.Amount <= 0 || ing.Amount > MaxPerIngredientMl select $"Invalid amount for ingredient '{ing.IngredientName}': {ing.Amount}ml (allowed: 1–{MaxPerIngredientMl})");

        if (ingredients.Sum(i => i.Amount) > MaxTotalMl)
            errors.Add($"Your drink can't contain more than {MaxTotalMl}ml");

        return errors.Count == 0;
    }
}
