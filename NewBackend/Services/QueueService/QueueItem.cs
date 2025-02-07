namespace NewBackend.Services.QueueService;

public class QueueItem {
    public required int PumpSlot { get; set; }
    public required int RequiredMl { get; set; }
}