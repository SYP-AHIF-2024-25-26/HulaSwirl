using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HulaSwirl.Services.UserServices;

/// <summary>
/// Convenience helpers for role‑based checks.
/// </summary>
public static class AuthorizationExtensions
{
    public static bool IsAdmin(this HttpContext context) => context.User.IsInRole("admin");
    public static bool IsOperator(this HttpContext context) => context.User.IsInRole("operator");
}
