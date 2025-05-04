using Microsoft.AspNetCore.Mvc;

namespace Backend.Apis.Users;

public static class UserApi
{
    private const string baseUrl = "/api/v1/users";

    public static IEndpointRouteBuilder MapUserApi(this IEndpointRouteBuilder app)
    {
        // 1) User erstellen
        app.MapPost(baseUrl, CreateUser.HandleCreate)
            .WithName(nameof(CreateUser.HandleCreate))
            .WithDescription("Create a new user")
            .WithTags("Users")
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status409Conflict);

        // 2) User löschen
        app.MapDelete($"{baseUrl}/{{username}}", DeleteUser.HandleDelete)
            .WithName(nameof(DeleteUser.HandleDelete))
            .WithDescription("Delete an existing user by Id")
            .WithTags("Users")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        // 3a) OTP anfordern
        app.MapPost($"{baseUrl}/{{username}}/request-otp", RequestOtp.HandleRequestOtp)
            .WithName(nameof(RequestOtp.HandleRequestOtp))
            .WithDescription("Request password reset OTP for a user")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        // 3b) Passwort zurücksetzen
        app.MapPost($"{baseUrl}/{{username}}/password-reset", ResetPassword.HandleReset)
            .WithName(nameof(ResetPassword.HandleReset))
            .WithDescription("Reset user's password using OTP")
            .WithTags("Users")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        // 4) Admin-Check
        app.MapGet($"{baseUrl}/{{username}}/is-admin", AdminCheck.HandleRoleCheck)
            .WithName(nameof(AdminCheck.HandleRoleCheck))
            .WithDescription("Check if a user has admin role")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);
        
        // Login
        app.MapPost($"{baseUrl}/login", Login.HandleLogin)
            .WithName(nameof(Login.HandleLogin))
            .WithDescription("Authenticate user and return JWT token")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        return app;
    }
}