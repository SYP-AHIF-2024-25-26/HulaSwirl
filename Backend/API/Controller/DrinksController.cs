namespace API.Controller {
    [Route("api/drinks")]
    [ApiController]
    public class DrinksController(AppDbContext context, ILogger<Drink> drinkLogger) : ControllerBase {
        private readonly ILogger<Drink> _drinkLogger = drinkLogger;
        private readonly AppDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Drink>>> GetDrinks() {
            var drinks = await _context.Drink.ToListAsync();
            return Ok(drinks);
        }

        [HttpPost()]
        public async Task<IActionResult> OrderDrink([FromQuery] int id) {
            //insert new order
            _drinkLogger.LogInformation("Ordering drink {}", id);

            var orders = await _context.Order.ToListAsync();

            var order = new Order() {
                Id = orders.Max(o => o.Id) + 1,
                DrinkId = id,
                OrderDateTime = DateTime.Now,
            };

            orders.Add(order);

            //start pumps

            var drink = await _context.Drink.Include(drink => drink.DrinkIngredients)
                .FirstOrDefaultAsync(drink => drink.Id == id);

            if (drink is null) {
                return NotFound($"drink not found with drink id {id}");
            }

            foreach (var drinkIngredient in drink.DrinkIngredients) {
                var requiredMl = drinkIngredient.Ml;
                //TODO check if all ingredients are available
                var slot = ((await _context.Pump.FirstOrDefaultAsync(p => p.IngredientName == drinkIngredient.IngredientName))!).Slot;
                //TODO check if enough fluid is available

                _ = Task.Run(() => PumpManager.Instance.StartPump(slot, requiredMl));

                //TODO subtract the amount that was used
            }

            await _context.SaveChangesAsync();

            return Ok("drink ordered");
        }
    }
}