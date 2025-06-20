using System.Collections.ObjectModel;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http;
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
        var ingredient = await context.Ingredient.FirstOrDefaultAsync(i => i.IngredientName.ToLower() == ingredientName.ToLower());

        if (ingredient != null) return ingredient;
        ingredient = new Ingredient(ingredientName, 0, 0);
        context.Ingredient.Add(ingredient);
        await context.SaveChangesAsync();

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

        if (unreferenced.Count > 0) context.Ingredient.RemoveRange(unreferenced);
        await context.SaveChangesAsync();
    }
    
    /// <summary>
    /// Updates the ingredients in bulk. 
    /// </summary>
    public static async Task<IResult> BulkUpdateAsync(
        AppDbContext context,
        IReadOnlyCollection<IngredientDto> dto)
    {
        var errors = new List<ErrorDto>();

        if (dto.Count == 0) return Results.UnprocessableEntity();

        // Shouldn't even be possible, but just in case
        var dupes = dto.GroupBy(d => d.IngredientName.ToLower())
            .Where(g => g.Count() > 1)
            .Select(g => g.Key);
        errors.AddRange(dupes.Select(d => new ErrorDto
        {
            Message = $"Duplicate ingredient '{d}'",
            Target = d
        }));

        foreach (var ing in dto)
        {
            // Shouldn't even be possible, but just in case
            if (string.IsNullOrWhiteSpace(ing.IngredientName))
                errors.Add(new ErrorDto
                {
                    Message = "Ingredients must have a name",
                    Target = string.Empty
                });

            if (ing.MaxAmount < 0 || ing.RemainingAmount < 0)
                errors.Add(new ErrorDto
                {
                    Message = $"Amounts for '{ing.IngredientName}' must be non-negative.",
                    Target = ing.IngredientName
                });
        }
        if (errors.Count > 0) return ErrorResults.BadRequest(errors.ToArray());

        var updated = new List<string>();

        foreach (var ing in dto)
        {
            var ingredient = await context.Ingredient
                .FirstOrDefaultAsync(i => i.IngredientName == ing.IngredientName);

            if (ingredient is null)
            {
                errors.Add(new ErrorDto
                {
                    Message = $"Ingredient '{ing.IngredientName}' not found",
                    Target = ing.IngredientName
                });
                continue;
            }

            ingredient.PumpSlot = ing.PumpSlot;
            ingredient.RemainingAmount = ing.RemainingAmount;
            ingredient.MaxAmount = ing.MaxAmount;
            updated.Add(ingredient.IngredientName);
        }

        if (errors.Count > 0) return ErrorResults.BadRequest(errors.ToArray());

        await context.SaveChangesAsync();
        return Results.Ok(updated);
    }
}
