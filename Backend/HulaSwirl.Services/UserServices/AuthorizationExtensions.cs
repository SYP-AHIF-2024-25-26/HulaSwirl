using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HulaSwirl.Services.UserServices;

/// <summary>
/// Convenience helpers for role‑based checks.
/// </summary>
public static class AuthorizationExtensions
{
    public static bool IsAdmin(this HttpContext context) => context.User.IsInRole("admin") || context.User.IsInRole("system");
    public static bool IsOperator(this HttpContext context) => context.User.IsInRole("operator");
    public static bool IsSystem(this HttpContext context) => context.User.IsInRole("system");
    public static bool IsSelf(this HttpContext context, string username)
    {
        var userNameClaim = context.User.FindFirst(ClaimTypes.Name)?.Value;
        return string.Equals(userNameClaim, username, StringComparison.OrdinalIgnoreCase);
    }
}
