using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HulaSwirl.Services.DataAccess.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HulaSwirl.Services.UserServices;

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
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    public string GetUsernameFromToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token["Bearer ".Length..].Trim());
        var usernameClaim = jwtToken.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Sub);
        return usernameClaim.Value;
    }
}