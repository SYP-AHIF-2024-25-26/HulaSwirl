namespace HulaSwirl.Services.Dtos;

/// <summary>
/// Data transfer object for conveying errors to the frontend in a consistent format.
/// </summary>
public class ErrorDto
{
    /// <summary>
    /// Human readable error message.
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// Name of the field or item the error relates to. An empty string implies a global error.
    /// </summary>
    public required string Target { get; set; }
}
