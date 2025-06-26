using Microsoft.AspNetCore.Http;

namespace HulaSwirl.Services.Dtos;

/// <summary>
/// Helper methods for returning typed error results from the API.
/// </summary>
public static class ErrorResults
{
    public static IResult BadRequest(params ErrorDto[] errors)
        => Results.Json(errors, statusCode: StatusCodes.Status400BadRequest);

    public static IResult Conflict(params ErrorDto[] errors)
        => Results.Json(errors, statusCode: StatusCodes.Status409Conflict);
    
    public static IResult Forbidden(string message = "You are not allowed to do that") 
        => Results.Json(new[]
            {
                new ErrorDto { Message = message, Target = string.Empty }
            }, statusCode: StatusCodes.Status403Forbidden);

    public static IResult NotFound(string message, string target = "")
        => Results.Json(new[]
            {
                new ErrorDto { Message = message, Target = target }
            }, statusCode: StatusCodes.Status404NotFound);

    public static IResult Problem(string message, int statusCode = StatusCodes.Status500InternalServerError)
        => Results.Json(new[] { new ErrorDto { Message = message, Target = string.Empty } }, statusCode: statusCode);
}
