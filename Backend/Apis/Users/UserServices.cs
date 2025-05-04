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

    private JwtSecurityToken? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.ReadToken(token) as JwtSecurityToken;
    }
    
    public bool IsAdmin(string jwt)
    {
        var token = ValidateToken(jwt);
        return token != null && token.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
    }
}
