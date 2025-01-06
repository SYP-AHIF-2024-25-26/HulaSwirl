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
            var ingredientNames = ingredients.Select(i => i.Name).ToList();
            var existingIngredients = await _context.Ingredients.Where(i => ingredientNames.Contains(i.Name)).ToListAsync();

            var slotMap = existingIngredients.ToDictionary(i => i.Name, i => i.Slot);

            foreach (var item in ingredients)
            {
                var existingIngredient = existingIngredients.FirstOrDefault(i => i.Name == item.Name);
                if (existingIngredient != null)
                {
                    existingIngredient.Slot = item.Slot;
                    existingIngredient.RemainingMl = item.RemainingMl;
                }
            }

            await _context.SaveChangesAsync();
            return Ok("Ingredients aktualisiert.");
        }
    }
}
