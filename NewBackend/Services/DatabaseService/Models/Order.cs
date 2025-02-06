using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NewBackend.Services.DatabaseService.Models;

public class Order {
    [Key] public int Id { get; set; }

    [ForeignKey(nameof(Drink))] public int DrinkId { get; set; }

    public DateTime OrderDateTime { get; set; }
}