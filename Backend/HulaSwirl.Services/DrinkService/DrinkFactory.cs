using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.DataAccess.Models;
using HulaSwirl.Services.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Services.DrinkService;

/// <summary>
/// Handles creation and update operations for drinks, decoupled from HTTP concerns.
/// </summary>
public static class DrinkFactory
{
    /// <summary>
    /// Creates a new drink based on the provided DTO.
    /// </summary>
    public static async Task<IResult> CreateDrinkAsync(AppDbContext context, EditDrinkDto dto)
    {
        var drink = new Drink(dto.Name, dto.Available, dto.ImgUrl, dto.Toppings, []);

        await using var tx = await context.Database.BeginTransactionAsync();
        try
        {
            foreach (var ingDto in dto.DrinkIngredients)
            {
                var globalIng = await IngredientService.EnsureIngredientExistsAsync(context, ingDto.IngredientName);
                drink.DrinkIngredients.Add(new DrinkIngredient(drink.Id, globalIng.IngredientName, ingDto.Amount, drink, globalIng));
            }

            context.Drink.Add(drink);
            await context.SaveChangesAsync();

            await tx.CommitAsync();
            return Results.Created("/api/drinks", drink);
        } catch (DbUpdateException e)
        {
            await tx.RollbackAsync();
            return Results.Problem(e.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Updates an existing drink instance with values from the DTO.
    /// </summary>
    public static async Task<IResult> UpdateDrinkAsync(AppDbContext context, int id, EditDrinkDto dto)
    {
        var drink = await context.Drink
            .Include(d => d.DrinkIngredients)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (drink is null) return Results.NotFound("Drink not found");

        drink.Name = dto.Name;
        drink.Available = dto.Available;
        drink.ImgUrl = dto.ImgUrl;
        drink.Toppings = dto.Toppings;

        var newNamesSet = dto.DrinkIngredients.Select(i => i.IngredientName.ToLower()).ToHashSet();

        await using var tx = await context.Database.BeginTransactionAsync();
        try
        {
            // Remove old ingredients
            var toRemove = drink.DrinkIngredients
                .Where(di => !newNamesSet.Contains(di.IngredientNameFk.ToLower()))
                .ToList();
            context.DrinkIngredient.RemoveRange(toRemove);
            await context.SaveChangesAsync();
            await IngredientService.RemoveUnreferencedIngredientsAsync(context);

            // Add or update ingredients
            foreach (var ingDto in dto.DrinkIngredients)
            {
                var globalIng = await IngredientService.EnsureIngredientExistsAsync(context, ingDto.IngredientName);

                var existing = drink.DrinkIngredients.FirstOrDefault(di => di.IngredientNameFk.ToLower() == globalIng.IngredientName.ToLower());

                if (existing != null)
                {
                    existing.Amount = ingDto.Amount;
                }
                else
                {
                    drink.DrinkIngredients.Add(new DrinkIngredient(drink.Id, globalIng.IngredientName, ingDto.Amount, drink, globalIng));
                }
            }
            await context.SaveChangesAsync();
            await tx.CommitAsync();

            return Results.Ok(drink);
        } catch (DbUpdateException e)
        {
            await tx.RollbackAsync();
            return Results.Problem(e.Message, statusCode: 500);
        }
    }
}
