CREATE
DATABASE IF NOT EXISTS Hula;
use
Hula;

SET
FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS Ingredient;
DROP TABLE IF EXISTS Pump;
DROP TABLE IF EXISTS Drink;
DROP TABLE IF EXISTS IngredientInBottle;
SET
FOREIGN_KEY_CHECKS = 1;

-- 2) CREATE TABLES

-- Table: IngredientInBottle
CREATE TABLE IngredientInBottle
(
    Name        VARCHAR(100) NOT NULL,
    RemainingMl INT          NOT NULL,
    MaxMl       INT          NOT NULL,
    PRIMARY KEY (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Drink
CREATE TABLE Drink
(
    Id       INT          NOT NULL AUTO_INCREMENT,
    Name     VARCHAR(100) NOT NULL,
    Enabled  TINYINT(1) NOT NULL,
    Img      VARCHAR(1000),
    Toppings VARCHAR(255),
    PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Pump
CREATE TABLE Pump
(
    Slot           INT NOT NULL,
    IngredientName VARCHAR(100),
    Active         TINYINT(1) NOT NULL,
    PRIMARY KEY (Slot),
    CONSTRAINT fk_pump_ingredient
        FOREIGN KEY (IngredientName) REFERENCES IngredientInBottle (Name)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Ingredient (vormals DrinkIngredient)
CREATE TABLE Ingredient
(
    DrinkId        INT          NOT NULL,
    IngredientName VARCHAR(100) NOT NULL,
    Ml             INT          NOT NULL,
    PRIMARY KEY (DrinkId, IngredientName),
    CONSTRAINT fk_ingredient_drink
        FOREIGN KEY (DrinkId) REFERENCES Drink (Id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    CONSTRAINT fk_ingredient_bottle
        FOREIGN KEY (IngredientName) REFERENCES IngredientInBottle (Name)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: `Order`
CREATE TABLE `Order`
(
    Id            INT      NOT NULL AUTO_INCREMENT,
    DrinkId       INT      NOT NULL,
    OrderDateTime DATETIME NOT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT fk_order_drink
        FOREIGN KEY (DrinkId) REFERENCES Drink (Id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) INSERT SAMPLE DATA

-- 3.1) INGREDIENTS IN BOTTLES
INSERT INTO IngredientInBottle (Name, RemainingMl, MaxMl)
VALUES ('Vodka', 500, 1000),
       ('Gin', 300, 750),
       ('Rum', 200, 750),
       ('Cola', 800, 1000),
       ('Tonic', 900, 1200);

-- 3.2) DRINKS
INSERT INTO Drink (Name, Enabled, Img, Toppings)
VALUES ('Moscow Mule', 1, NULL, 'Lime Slice'),
       ('Gin & Tonic', 1, NULL, 'Lime Wedge'),
       ('Rum & Coke', 0, NULL, 'Lemon Slice');

-- 3.3) PUMPS
INSERT INTO Pump (Slot, IngredientName, Active)
VALUES (1, 'Vodka', 1),
       (2, 'Gin', 1);

-- 3.4) INGREDIENTS IN DRINKS
INSERT INTO Ingredient (DrinkId, IngredientName, Ml)
VALUES (1, 'Vodka', 50),
       (1, 'Tonic', 150),
       (2, 'Gin', 50),
       (2, 'Tonic', 150),
       (3, 'Rum', 50),
       (3, 'Cola', 150);

-- 3.5) ORDERS
INSERT INTO `Order` (DrinkId, OrderDateTime)
VALUES (1, '2025-02-01 14:25:00'),
       (2, '2025-02-01 15:10:00'),
       (1, '2025-02-02 09:30:00'),
       (3, '2025-02-03 12:00:00');
