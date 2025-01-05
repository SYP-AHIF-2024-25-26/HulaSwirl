using API.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controller
{
    [Route("api/drinks")]
    [ApiController]
    public class DrinksController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DrinksController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Drink>>> GetDrinks()
        {
            var drinks = await _context.Drinks.ToListAsync();
            return Ok(drinks);
        }

        [HttpPost("order")]
        public async Task<IActionResult> OrderDrink([FromBody] List<DrinkIngredient> order)
        {
            foreach (var item in order)
            {
                var ingredient = await _context.Ingredients.FindAsync(item.Name);
                if (ingredient == null || ingredient.RemainingMl < item.Amount)
                    return BadRequest($"Nicht genug {item.Name} vorhanden.");
                ingredient.RemainingMl -= item.Amount;
            }
            await _context.SaveChangesAsync();
            return Ok("Getränk gemischt.");
        }
    }
}