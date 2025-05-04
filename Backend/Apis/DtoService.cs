namespace Backend.Apis;

public static class ValidationExtensions
{
    public static bool TryValidate<T>(this T dto, out List<string> errors)
    {
        var context = new ValidationContext(dto);
        var results = new List<ValidationResult>();
        bool isValid = Validator.TryValidateObject(dto, context, results, true);
        errors = results.Select(r => r.ErrorMessage!).ToList();
        return isValid;
    }
}