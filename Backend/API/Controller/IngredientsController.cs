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
            var existingIngredients = await _context.Ingredients.ToListAsync();

            foreach (var item in ingredients)
            {
                var existingIngredient = existingIngredients.FirstOrDefault(i => i.Name == item.Name);
                if (existingIngredient != null)
                {
                    existingIngredient.Slot = item.Slot;
                    existingIngredient.RemainingMl = item.RemainingMl;
                }
            }

            var slotCounts = existingIngredients.GroupBy(i => i.Slot).ToDictionary(g => g.Key, g => g.Count());
            if (slotCounts.Any(kv => kv.Value > 1 && kv.Key != 0))
            {
                return BadRequest("Ein Slot kann nicht mehrfach vergeben werden.");
            }

            await _context.SaveChangesAsync();
            return Ok("Ingredients aktualisiert.");
        }
    }
}
