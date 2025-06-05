﻿namespace HulaSwirl.Services.Dtos;

// Create & Edit
public class EditDrinkDto
{
    public required string Name { get; set; }
    public required bool Available { get; set; }
    public required string ImgUrl { get; set; }
    public required string Toppings { get; set; }
    public required DrinkIngredientDto[] DrinkIngredients { get; set; }
}

public class DrinkDto : EditDrinkDto
{
    public required int Id { get; set; }
}