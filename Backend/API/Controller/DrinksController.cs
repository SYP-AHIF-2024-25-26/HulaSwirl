namespace API.Controller
{
    [Route("api/drinks")]
    [ApiController]
    public class DrinksController(AppDbContext context) : ControllerBase {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Drink>>> GetDrinks()
        {
            var drinks = await context.Drinks.ToListAsync();
            return Ok(drinks);
        }

        [HttpPost("order")]
        public async Task<IActionResult> OrderDrink([FromBody] List<DrinkIngredient> orders)
        {
            foreach (var order in orders)
            {
                var ingredient = await context.Ingredients.FindAsync(order.IngredientName);
                if (ingredient is null || ingredient.RemainingMl < order.Ml)
                    return BadRequest($"Nicht genug {order.IngredientName} vorhanden.");
                
                _ = Task.Run(() => PumpManager.Instance.StartPump(ingredient.Pump.Slot, order.Ml));
                
                ingredient.RemainingMl -= order.Ml;
            }
            await context.SaveChangesAsync();

            return Ok("Getränk gemischt.");
        }
    }
}