namespace API.Controller {
    [Route("api/admin/ingredients")]
    [ApiController]
    public class DrinkIngredientsController(AppDbContext context) : ControllerBase {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DrinkIngredient>>> GetAllDrinkIngredients() {
            return await context.DrinkIngredients.ToListAsync();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DrinkIngredient>>> GetAllUniqueDrinkIngredients() {
            return await context.DrinkIngredients.Distinct().ToListAsync();
        }


        [HttpPut]
        public async Task<IActionResult> UpdateIngredients([FromBody] DrinkIngredient[] ingredients) {
            var existingIngredients = await context.DrinkIngredients.ToListAsync();

            foreach (var ingredient in ingredients) {
                var existingIngredient = existingIngredients.FirstOrDefault(i => i.IngredientName == ingredient.IngredientName);
                if (existingIngredient != null) {
                    existingIngredient.Ml = ingredient.Ml;
                }
            }

            await context.SaveChangesAsync();
            return Ok("Ingredients aktualisiert.");
        }
    }
}