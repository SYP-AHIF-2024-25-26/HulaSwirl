using System.Text.Json;
using HulaSwirl.Services.DataAccess;
using HulaSwirl.Services.Dtos;
using HulaSwirl.Services.UserServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HulaSwirl.Api.Orders;

public static class GenerateOrder
{
    public class PromptRequest
    {
        public string Prompt { get; set; }
    }
    
    public static async Task<IResult> HandleGenerateOrder(
        AppDbContext db, 
        HttpContext httpContext, 
        IConfiguration config, 
        [FromBody] PromptRequest pr)
    {
        if (!httpContext.IsAdmin()) 
            return ErrorResults.Forbidden();

        var existingIngredients = await db.Ingredient
            .Select(i => i.IngredientName)
            .ToListAsync();

        if (existingIngredients.Count == 0)
        {
            return Results.BadRequest("No available ingredients to generate a drink.");
        }

        var apiKey = config["OpenAI:ApiKey"];
        var model = config["OpenAI:Model"] ?? "gpt-4o-mini";
        const string endpoint = "https://api.openai.com/v1/chat/completions";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return Results.InternalServerError("OpenAI API key is not configured.");
        }
        
        var maxIngredients = config["HulaConfig:MaxIngredientsPerDrink"];
        var maxMlPerIngredient = config["HulaConfig:MaxMlPerIngredient"];
        var maxMlPerDrink = config["HulaConfig:MaxMlPerDrink"];

        var systemPrompt =
            $"You are a cocktail generator for a bar. You must create a list of at most {maxIngredients} ingredients, " +
            $"with the total volume of the drink not exceeding {maxMlPerDrink}ml and each single ingredient having at most {maxMlPerIngredient}ml. " +
            "You may only use the provided available ingredients and each ingredient amount must be an integer greater than 0 in milliliters. " +
            "Your response MUST follow these rules exactly: " +
            "1) Respond with a SINGLE JSON ARRAY only. " +
            "2) Do NOT wrap the array in any object. " +
            "3) Do NOT add any explanation, text, backticks, or other characters before or after the array. " +
            "4) The JSON must be valid. " +
            "The JSON array must have the following shape: " +
            "[{ \"ingredientName\": string, \"amount\": number }].";

        var userPrompt = new
        {
            existingIngredients,
            pr.Prompt
        };

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        var requestBody = new
        {
            model,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = JsonSerializer.Serialize(userPrompt) }
            },
            temperature = 0.8
        };

        using var response = await client.PostAsJsonAsync(endpoint, requestBody);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            return Results.InternalServerError($"OpenAI request failed: {response.StatusCode} - {errorContent}");
        }

        var json = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);
        var content = doc
            .RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();
        
        if (string.IsNullOrWhiteSpace(content))
        {
            return Results.InternalServerError("OpenAI returned empty content, please try again.");
        }
        
        if (content.EndsWith('}'))
        {
            // Sometimes the AI adds an extra closing brace, remove it
            content = content[..^1];
        }

        DrinkIngredientDto[]? generated;
        try
        {
            generated = JsonSerializer.Deserialize<DrinkIngredientDto[]>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException)
        {
            return Results.InternalServerError("Failed to parse AI response into order format, please try again.");
        }

        if (generated == null || generated.Length == 0)
        {
            return Results.Problem("AI did not return a valid order proposal, please try again.");
        }

        return Results.Ok(generated);
    }
}