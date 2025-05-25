using System.Collections.ObjectModel;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Services.DrinkService;

/// <summary>
/// Common data‑access helpers for ingredient entities.
/// </summary>
public static class IngredientService
{
    public static async Task<List<Ingredient>> GetAllAvailableIngredientsAsync(IEnumerable<string> ingredientNames, AppDbContext context)
    {
        return await context.Ingredient
            .Include(i => i.Pump)
            .Where(i => i.PumpSlot != null && ingredientNames.Select(n => n.ToLower()).Contains(i.IngredientName.ToLower()))
            .ToListAsync();
    }
    
    /// <summary>
    /// Retrieves the ingredient by name or creates a new persistent entry if it doesn't exist.
    /// </summary>
    public static async Task<Ingredient> EnsureIngredientExistsAsync(AppDbContext context, string ingredientName)
    {
        var ingredient = await context.Ingredient
            .FirstOrDefaultAsync(i => i.IngredientName.ToLower() == ingredientName.ToLower());

        if (ingredient != null) return ingredient;
        ingredient = new Ingredient(ingredientName, 0, 0);
        context.Ingredient.Add(ingredient);

        return ingredient;
    }

    /// <summary>
    /// Removes ingredients that are no longer referenced by any drink.
    /// </summary>
    public static async Task RemoveUnreferencedIngredientsAsync(AppDbContext context)
    {
        var unreferenced = await context.Ingredient
            .Where(i => !context.DrinkIngredient.Any(di => di.IngredientNameFk == i.IngredientName))
            .ToListAsync();

        if (unreferenced.Count == 0) return;

        context.Ingredient.RemoveRange(unreferenced);
        await context.SaveChangesAsync();
    }
    
    /// <summary>
    /// Updates the ingredients in bulk. 
    /// </summary>
    public static async Task<Result<List<string>>> BulkUpdateAsync(
        AppDbContext context,
        IReadOnlyCollection<IngredientDto> dto)
    {
        var errors = Validate(dto);
        if (errors.Count > 0)
            return Result<List<string>>.Failure(errors);

        var updated = new List<string>();

        foreach (var ing in dto)
        {
            var ingredient = await context.Ingredient
                .FirstOrDefaultAsync(i => i.IngredientName == ing.IngredientName);

            if (ingredient is null)
            {
                errors.Add($"Ingredient '{ing.IngredientName}' not found");
                continue;
            }

            ingredient.PumpSlot = ing.PumpSlot;
            ingredient.RemainingAmount = ing.RemainingAmount;
            ingredient.MaxAmount = ing.MaxAmount;
            updated.Add(ingredient.IngredientName);
        }

        if (errors.Count > 0)
            return Result<List<string>>.Failure(errors);

        await context.SaveChangesAsync();
        return Result<List<string>>.Success(updated);
    }

    private static List<string> Validate(IReadOnlyCollection<IngredientDto> dto)
    {
        var errors = new List<string>();

        if (dto.Count == 0)
        {
            errors.Add("At least one ingredient must be supplied.");
            return errors;
        }

        var dupes = dto.GroupBy(d => d.IngredientName.ToLower())
            .Where(g => g.Count() > 1)
            .Select(g => g.Key);
        errors.AddRange(dupes.Select(d => $"Duplicate ingredient '{d}'."));

        foreach (var ing in dto)
        {
            if (string.IsNullOrWhiteSpace(ing.IngredientName))
                errors.Add("IngredientName cannot be empty.");

            if (ing.MaxAmount < 0 || ing.RemainingAmount < 0)
                errors.Add($"Amounts for '{ing.IngredientName}' must be non-negative.");
        }

        return errors;
    }
}
