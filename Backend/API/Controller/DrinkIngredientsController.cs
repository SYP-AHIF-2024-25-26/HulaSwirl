namespace API.Controller {
    [Route("api/admin/ingredients")]
    [ApiController]
    public class DrinkIngredientsController(AppDbContext context) : ControllerBase {
        [HttpGet]
        public async Task<List<IngredientDto>> GetAllIngredients() {
            var ingredients = await context.Ingredient.Include(ingredient => ingredient.DrinkIngredients)
                .Include(ingredient => ingredient.Pump).ToListAsync();

            return ingredients.Select(ingredient => new IngredientDto() {
                Name = ingredient.Name, Slot = ingredient.Pump?.Slot,
                RemainingMl = ingredient.RemainingMl, MaxMl = ingredient.MaxMl
            }).ToList();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateIngredients([FromBody] IngredientDto[] ingredients) {
            var existingIngredients = await context.Ingredient.Include(ingredient => ingredient.DrinkIngredients)
                .Include(ingredient => ingredient.Pump).ToListAsync();

            foreach (var existingIngredient in existingIngredients) {
                var newIngredientDto =
                    ingredients.FirstOrDefault(ingredient => ingredient.Name == existingIngredient.Name);

                if (newIngredientDto == null) {
                    continue;
                }

                //case 1: add unused ingredient to pump
                if (existingIngredient.Pump is null && newIngredientDto.Slot.HasValue) {
                    var existingPump =
                        (await context.Pump.ToListAsync()).FirstOrDefault(pump => pump.Slot == newIngredientDto.Slot);

                    if (existingPump != null) {
                        //TODO check if existing Pump is not already in use by other Ingredient
                        existingPump.IngredientName = newIngredientDto.Name;
                    }
                } //case 2: remove ingredient from pump
                else if (existingIngredient.Pump is not null && newIngredientDto.Slot is null) {
                    var existingPump = existingIngredient.Pump;
                    existingPump.IngredientName = null;
                }

                //update other columns

                existingIngredient.RemainingMl = newIngredientDto.RemainingMl;
                existingIngredient.MaxMl = newIngredientDto.MaxMl;
            }

            await context.SaveChangesAsync();
            return Ok("Ingredients aktualisiert.");
        }
    }

    public class IngredientDto {
        public required string Name { get; set; }
        public int? Slot { get; set; }
        public required int RemainingMl { get; set; }
        public required int MaxMl { get; set; }
    }
}