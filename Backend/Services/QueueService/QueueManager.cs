namespace Backend.Services.QueueService;

public class QueueManager
{
    //TODO implement queue for all Order for drinks
    private readonly List<List<QueueItem>> _queue = [];

    public void Queue(List<QueueItem> queueItems)
    {
        _queue.Add(queueItems);
    }
}