using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Apis.Drinks;

public static class GetAllDrinks
{
    public static async Task<List<DrinkDto>> HandleGetAllDrinks(AppDbContext context)
    {
        var drinks = await context.Drink.Include(d => d.DrinkIngredients).ToListAsync();

        return drinks.Select(d => new DrinkDto()
        {
            Id = d.ID,
            Name = d.Name,
            Available = d.Available,
            ImgUrl = d.ImgUrl,
            Toppings = d.Toppings,
            DrinkIngredients = d.DrinkIngredients.Select(i => new DrinkIngredientDto
            {
                IngredientName = i.IngredientName,
                Amount = i.Ml
            }).ToList()
        }).ToList();
    }

    public class DrinkDto
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required bool Available { get; set; }
        public required string ImgUrl { get; set; }
        public required string Toppings { get; set; }
        public List<DrinkIngredientDto> DrinkIngredients { get; set; } = [];
    }

    public class DrinkIngredientDto
    {
        public required string IngredientName { get; set; }
        public required int Amount { get; set; }
    }
}