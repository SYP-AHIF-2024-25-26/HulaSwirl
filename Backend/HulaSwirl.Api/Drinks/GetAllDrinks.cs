using HulaSwirl.Services;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Drinks;

public static class GetAllDrinks
{
    public static async Task<IResult> HandleGetAllDrinks(AppDbContext db)
    {
        var drinks = await db.Drink.Include(d => d.DrinkIngredients).ToListAsync();

        return Results.Ok(drinks.Select(d => new DrinkDto
        {
            Id = d.Id,
            Name = d.Name,
            Available = d.Available,
            ImgUrl = d.ImgUrl,
            Toppings = d.Toppings,
            DrinkIngredients = d.DrinkIngredients.Select(i => new DrinkIngredientDto
            {
                IngredientName = i.IngredientNameFk,
                Amount = i.Amount
            }).ToArray()
        }).ToList());
    }
}