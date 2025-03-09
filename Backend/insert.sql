INSERT INTO Pump (Slot, Active) VALUES (99, 1);
INSERT INTO Pump (Slot, Active) VALUES (2, 0);

-- IngredientInBottles
INSERT INTO IngredientInBottle (Name, RemainingMl, MaxMl, PumpSlot) VALUES ('Vodka', 500, 1000, 1);
INSERT INTO IngredientInBottle (Name, RemainingMl, MaxMl, PumpSlot) VALUES ('Whiskey', 300, 700, 2);
INSERT INTO IngredientInBottle (Name, RemainingMl, MaxMl, PumpSlot) VALUES ('Sugar Syrup', 1000, 1200, NULL);

-- Drinks
INSERT INTO Drink (Name, Available, ImgUrl, Toppings)
VALUES ('Mojito', 1, '/images/mojito.png', 'Mint Leaves');
INSERT INTO Drink (Name, Available, ImgUrl, Toppings)
VALUES ('Whiskey Sour', 1, '/images/whiskeysour.png', 'Lemon Slice');

-- Ingredients for each Drink
-- Mojito -> uses Vodka/Sugar Syrup as an example (adjust as you like)
INSERT INTO Ingredient (IngredientName, Ml, DrinkID) VALUES ('Vodka', 50, 1);
INSERT INTO Ingredient (IngredientName, Ml, DrinkID) VALUES ('Sugar Syrup', 10, 1);

-- Whiskey Sour -> uses Whiskey/Sugar Syrup
INSERT INTO Ingredient (IngredientName, Ml, DrinkID) VALUES ('Whiskey', 60, 2);
INSERT INTO Ingredient (IngredientName, Ml, DrinkID) VALUES ('Sugar Syrup', 15, 2);

-- Orders
INSERT INTO DrinkOrder (OrderDate, DrinkID) VALUES ('2023-01-01', 1);
INSERT INTO DrinkOrder (OrderDate, DrinkID) VALUES ('2023-01-02', 2);