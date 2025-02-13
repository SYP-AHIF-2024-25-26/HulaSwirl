namespace Backend.Services.QueueService;

public record QueueItem
{
    public required int PumpSlot { get; set; }
    public required int RequiredMl { get; set; }
}