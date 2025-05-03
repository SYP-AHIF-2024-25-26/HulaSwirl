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
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status409Conflict);

        // 2) User löschen
        app.MapDelete($"{baseUrl}/{{id:int}}", DeleteUser.HandleDelete)
            .WithName(nameof(DeleteUser.HandleDelete))
            .WithDescription("Delete an existing user by Id")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        // 3a) OTP anfordern
        app.MapPost($"{baseUrl}/{{id:int}}/password-reset/request", RequestOtp.HandleRequestOtp)
            .WithName(nameof(RequestOtp.HandleRequestOtp))
            .WithDescription("Request password reset OTP for a user")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        // 3b) Passwort zurücksetzen
        app.MapPost($"{baseUrl}/{{id:int}}/password-reset", ResetPassword.HandleReset)
            .WithName(nameof(ResetPassword.HandleReset))
            .WithDescription("Reset user's password using OTP")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        // 4) Admin-Check
        app.MapGet($"{baseUrl}/{{id:int}}/is-admin", AdminCheck.HandleRoleCheck)
            .WithName(nameof(AdminCheck.HandleRoleCheck))
            .WithDescription("Check if a user has admin role")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
        
        // Login
        app.MapPost($"{baseUrl}/login", Login.HandleLogin)
            .WithName(nameof(Login.HandleLogin))
            .WithDescription("Authenticate user and return JWT token")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        return app;
    }
}