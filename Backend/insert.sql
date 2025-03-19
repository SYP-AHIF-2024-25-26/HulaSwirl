PRAGMA wal_checkpoint(FULL);

-- Pumps
INSERT INTO Pump (Slot, Active) VALUES (1, 1);
INSERT INTO Pump (Slot, Active) VALUES (2, 0);

-- Global Ingredients (IngredientInBottles)
INSERT INTO Ingredient (IngredientName, RemainingAmount, MaxAmount, PumpSlot) VALUES ('Vodka', 500, 1000, 1);
INSERT INTO Ingredient (IngredientName, RemainingAmount, MaxAmount, PumpSlot) VALUES ('Whiskey', 300, 700, 2);
INSERT INTO Ingredient (IngredientName, RemainingAmount, MaxAmount, PumpSlot) VALUES ('Sugar Syrup', 1000, 1200, NULL);

-- Drinks
INSERT INTO Drink (Name, Available, ImgUrl, Toppings)
VALUES ('Mojito', 1, 'https://www.gutekueche.at/storage/media/recipe/126950/X_17926_Mojito-3.jpg', 'Mint Leaves');
INSERT INTO Drink (Name, Available, ImgUrl, Toppings)
VALUES ('Whiskey Sour', 1, 'https://cdn.selection-prestige.de/media/catalog/product/cache/image/1536x/a4e40ebdc3e371adff845072e1c73f37/9/9/99733_jack-daniels-old-no-7-tennessee-whiskey-10l-40-vol.jpg', 'Lemon Slice');

-- DrinkIngredients for each Drink (using IngredientId and Amount)
-- Mojito uses Vodka (ID=1) and Sugar Syrup (ID=3)
INSERT INTO DrinkIngredient (DrinkId, IngredientNameFK, Amount) VALUES (1, 'Vodka', 50);
INSERT INTO DrinkIngredient (DrinkId, IngredientNameFK, Amount) VALUES (1, 'Sugar Syrup', 10);

-- Whiskey Sour uses Whiskey (ID=2) and Sugar Syrup (ID=3)
INSERT INTO DrinkIngredient (DrinkId, IngredientNameFK, Amount) VALUES (2, 'Whiskey', 60);
INSERT INTO DrinkIngredient (DrinkId, IngredientNameFK, Amount) VALUES (2, 'Sugar Syrup', 15);

-- Orders
INSERT INTO DrinkOrder (OrderDate, DrinkID) VALUES ('2023-01-01', 1);
INSERT INTO DrinkOrder (OrderDate, DrinkID) VALUES ('2023-01-02', 2);

PRAGMA journal_mode;
