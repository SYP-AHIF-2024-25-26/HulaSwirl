namespace API.Controller {
    [Route("api/admin/ingredients")]
    [ApiController]
    public class DrinkIngredientsController(AppDbContext context) : ControllerBase {
        [HttpGet]
        public async Task<List<IngredientAnswerDTO>> GetAllDrinkIngredients() {
            var drinkIngredients = await context.DrinkIngredient.Include(drinkIngredient => drinkIngredient.Ingredient)
                .ThenInclude(ingredient => ingredient.Pump).ToListAsync();

            return drinkIngredients.Select(drinkIngredient => new IngredientAnswerDTO() {
                Name = drinkIngredient.IngredientName, Slot = drinkIngredient.Ingredient?.Pump.Slot,
                RemainingML = drinkIngredient.Ingredient?.RemainingMl, MaxMl = drinkIngredient.Ingredient?.MaxMl
            }).ToList();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateIngredients([FromBody] DrinkIngredient[] ingredients) {
            var existingIngredients = await context.DrinkIngredient.ToListAsync();

            foreach (var ingredient in ingredients) {
                var existingIngredient =
                    existingIngredients.FirstOrDefault(i => i.IngredientName == ingredient.IngredientName);
                if (existingIngredient != null) {
                    existingIngredient.Ml = ingredient.Ml;
                }
            }

            await context.SaveChangesAsync();
            return Ok("Ingredients aktualisiert.");
        }
    }

    public class IngredientAnswerDTO {
        public required string Name { get; set; }
        public int? Slot { get; set; }
        public int? RemainingML { get; set; }
        public int? MaxMl { get; set; }
    }
}