using System.IdentityModel.Tokens.Jwt;
using Backend.Services.DatabaseService;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Apis.Users;

using BCrypt.Net;
using System.Security.Claims;
using System.Text;

public class BCryptHasher
{
    public string Hash(string password) => BCrypt.HashPassword(password);
    public bool Verify(string hash, string password) => BCrypt.Verify(password, hash);
}

public class JwtService
{
    private readonly IConfiguration _config;
    private readonly byte[] _key;

    public JwtService(IConfiguration config)
    {
        _config = config;
        _key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
    }

    public string GenerateToken(User user)
    {
        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var creds = new SigningCredentials(new SymmetricSecurityKey(_key), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public static class AuthService
{
    public static bool IsAdmin(User user)
    {
        return user.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
    }
    
    public static async Task<bool> ChangePermitted(string username, AppDbContext db, JwtService jwtService)
    {
        var user = await db.User.FirstOrDefaultAsync(u => u.Username == username);
        return user != null && IsAdmin(user);
    }
}
