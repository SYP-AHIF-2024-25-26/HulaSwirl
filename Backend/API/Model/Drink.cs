namespace API.Model
{
    public class Drink
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Img { get; set; }
        public string Toppings { get; set; }
        public List<DrinkIngredient> Ingredients { get; set; }
    }
}
