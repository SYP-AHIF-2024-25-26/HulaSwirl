using API.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controller
{
    [Route("api/admin/ingredients")]
    [ApiController]
    public class IngredientsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public IngredientsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ingredient>>> GetIngredients()
        {
            return await _context.Ingredients.ToListAsync();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateIngredients([FromBody] Ingredient[] ingredients)
        {
            foreach (var item in ingredients)
            {
                var existingIngredient = await _context.Ingredients.FindAsync(item.Name);
                if (existingIngredient == null) return NotFound();
                existingIngredient.Slot = item.Slot;
                existingIngredient.RemainingMl = item.RemainingMl;
            }
            await _context.SaveChangesAsync();
            return Ok("Ingredients aktualisiert.");
        }
    }
}
