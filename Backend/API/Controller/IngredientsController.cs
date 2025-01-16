namespace API.Controller {
    [Route("api/admin/ingredients")]
    [ApiController]
    public class IngredientsController(AppDbContext context) : ControllerBase {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ingredient>>> GetIngredients() {
            return await context.Ingredients.ToListAsync();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateIngredients([FromBody] Ingredient[] ingredients) {
            var existingIngredients = await context.Ingredients.ToListAsync();

            foreach (var ingredient in ingredients) {
                var existingIngredient = existingIngredients.FirstOrDefault(i => i.Name == ingredient.Name);
                if (existingIngredient != null) {
                    existingIngredient.RemainingMl = ingredient.RemainingMl;
                }
            }

            await context.SaveChangesAsync();
            return Ok("Ingredients aktualisiert.");
        }
    }
}