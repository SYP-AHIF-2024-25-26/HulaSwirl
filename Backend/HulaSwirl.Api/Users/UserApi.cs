namespace HulaSwirl.Api.Users;

public static class UserApi
{
    private const string baseUrl = "/api/v1/users";

    public static IEndpointRouteBuilder MapUserApi(this IEndpointRouteBuilder app)
    {
        app.Map("ws/user-updates", UserUpdates.HandleUserUpdates);
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

        app.MapGet(baseUrl, GetAllUsers.HandleGetAll)
            .WithName(nameof(GetAllUsers.HandleGetAll))
            .WithDescription("Get all users")
            .WithTags("Users")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden);

        app.MapPatch($"{baseUrl}/{{username}}/role", UpdateUserRole.HandleUpdate)
            .WithName(nameof(UpdateUserRole.HandleUpdate))
            .WithDescription("Update role of user")
            .WithTags("Users")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        // 4) Admin-Check
        app.MapGet($"{baseUrl}/is-admin", RoleCheck.HandleAdminCheck)
            .WithName(nameof(RoleCheck.HandleAdminCheck))
            .WithDescription("Check if a user has admin role")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK);

        app.MapGet($"{baseUrl}/is-system", RoleCheck.HandleSystemCheck)
            .WithName(nameof(RoleCheck.HandleSystemCheck))
            .WithDescription("Check if a user has system role")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK);
        
        // 5) Operator-Check
        app.MapGet($"{baseUrl}/is-operator", RoleCheck.HandleOperatorCheck)
            .WithName(nameof(RoleCheck.HandleOperatorCheck))
            .WithDescription("Check if a user has operator role")
            .WithTags("Users")
            .Produces(StatusCodes.Status200OK);
        
        app.MapGet($"{baseUrl}/info", GetUserInfo.HandleGetUserInfo)
            .WithName(nameof(GetUserInfo.HandleGetUserInfo))
            .WithDescription("Get information about the current user via JWT")
            .WithTags("Users")
            .RequireAuthorization()
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
        
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