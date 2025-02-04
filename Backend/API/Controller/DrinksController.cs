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
        public async Task<IActionResult> OrderDrink([FromQuery] int id, PumpManager manager) {
            //insert new order
            _drinkLogger.LogInformation("Ordering drink {}", id);

            var orders = await _context.Order.ToListAsync();

            var order = new Order() {
                Id = orders.Max(o => o.Id) + 1,
                DrinkId = id,
                OrderDateTime = DateTime.Now,
            };

            orders.Add(order);
            _drinkLogger.LogInformation("order added");

            //start pumps

            var drink = await _context.Drink.Include(drink => drink.DrinkIngredients)
                .FirstOrDefaultAsync(drink => drink.Id == id);


            if (drink is null) {
                return NotFound($"drink not found with drink id {id}");
            }

            _drinkLogger.LogInformation(drink.Name);


            foreach (var drinkIngredient in drink.DrinkIngredients) {
                var requiredMl = drinkIngredient.Ml;
                //TODO check if all ingredients are available
                var slot = ((await _context.Pump.FirstOrDefaultAsync(p =>
                    p.IngredientName == drinkIngredient.IngredientName))!).Slot;
                //TODO check if enough fluid is available
                _drinkLogger.LogInformation("starting pump with slot {} and ml: {}", slot, requiredMl);

                _ = Task.Run(() => manager.StartPump(slot, requiredMl));

                //TODO subtract the amount that was used
            }

            await _context.SaveChangesAsync();

            return Ok("drink ordered");
        }

        [HttpPost("order")]
        public async Task<IActionResult> OrderDrink([FromBody] List<OrderDto> orders, PumpManager manager) {
            foreach (var order in orders) {
                var ingredient = await context.Ingredient.FindAsync(order.Name);
                if (ingredient is null || ingredient.RemainingMl < order.Amount)
                    return BadRequest($"Nicht genug {order.Name} vorhanden.");

                if (ingredient.Pump is null) {
                    return BadRequest("Pump with ingredient not found.");
                }

                _ = Task.Run(() => manager.StartPump(ingredient.Pump.Slot, order.Amount));

                ingredient.RemainingMl -= order.Amount;
            }

            await _context.SaveChangesAsync();

            return Ok("drink ordered");
        }
    }
    public class OrderDto {
        public required string Name { get; set; }
        public required int Amount { get; set; }
    }
}
