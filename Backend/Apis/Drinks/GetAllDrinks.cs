using Backend.Apis.Ingredients;
using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class GetAllDrinks
{
    public static async Task<List<DrinkDto>> HandleGetAllDrinks(AppDbContext context)
    {
        var drinks = await context.Drink.Include(d => d.DrinkIngredients).ToListAsync();

        return drinks.Select(d => new DrinkDto
        {
            Id = d.Id,
            Name = d.Name,
            Available = d.Available,
            ImgUrl = d.ImgUrl,
            Toppings = d.Toppings,
            DrinkIngredients = d.DrinkIngredients.Select(i => new DrinkIngredientDto
            {
                IngredientName = i.IngredientNameFK,
                Amount = i.Amount
            }).ToList()
        }).ToList();
    }
}