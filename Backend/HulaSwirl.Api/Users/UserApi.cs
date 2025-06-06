namespace HulaSwirl.Api.Users;

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

        // 4) Admin-Check
        app.MapGet($"{baseUrl}/is-admin", RoleCheck.HandleAdminCheck)
            .WithName(nameof(RoleCheck.HandleAdminCheck))
            .WithDescription("Check if a user has admin role")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK);
        
        // 5) Operator-Check
        app.MapGet($"{baseUrl}/is-operator", RoleCheck.HandleOperatorCheck)
            .WithName(nameof(RoleCheck.HandleOperatorCheck))
            .WithDescription("Check if a user has operator role")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK);
        
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