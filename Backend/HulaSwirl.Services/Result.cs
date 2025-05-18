using System.Collections.Generic;

namespace HulaSwirl.Services;

/// <summary>
/// Simple functional‑style result wrapper used by the logic layer.
/// </summary>
public record Result<T>(bool IsSuccess, T Value, List<string> Errors)
{
    public static Result<T> Success(T value) => new(true, value, []);
    public static Result<T> Failure(List<string> errors) => new(false, default!, errors);
}
