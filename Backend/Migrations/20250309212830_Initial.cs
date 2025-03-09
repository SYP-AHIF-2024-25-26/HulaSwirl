using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drink",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Enabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    ImgUrl = table.Column<string>(type: "TEXT", maxLength: 1024, nullable: false),
                    Toppings = table.Column<string>(type: "TEXT", maxLength: 1024, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drink", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Pump",
                columns: table => new
                {
                    Slot = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Active = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pump", x => x.Slot);
                });

            migrationBuilder.CreateTable(
                name: "DrinkOrder",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OrderDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    DrinkID = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrinkOrder", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DrinkOrder_Drink_DrinkID",
                        column: x => x.DrinkID,
                        principalTable: "Drink",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "IngredientInBottle",
                columns: table => new
                {
                    Name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    RemainingMl = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxMl = table.Column<int>(type: "INTEGER", nullable: false),
                    PumpSlot = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientInBottle", x => x.Name);
                    table.ForeignKey(
                        name: "FK_IngredientInBottle_Pump_PumpSlot",
                        column: x => x.PumpSlot,
                        principalTable: "Pump",
                        principalColumn: "Slot");
                });

            migrationBuilder.CreateTable(
                name: "Ingredient",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Ml = table.Column<int>(type: "INTEGER", nullable: false),
                    IngredientName = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    DrinkID = table.Column<int>(type: "INTEGER", nullable: false),
                    IngredientInBottleName = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredient", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Ingredient_Drink_DrinkID",
                        column: x => x.DrinkID,
                        principalTable: "Drink",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ingredient_IngredientInBottle_IngredientInBottleName",
                        column: x => x.IngredientInBottleName,
                        principalTable: "IngredientInBottle",
                        principalColumn: "Name");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DrinkOrder_DrinkID",
                table: "DrinkOrder",
                column: "DrinkID");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredient_DrinkID",
                table: "Ingredient",
                column: "DrinkID");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredient_IngredientInBottleName",
                table: "Ingredient",
                column: "IngredientInBottleName");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientInBottle_PumpSlot",
                table: "IngredientInBottle",
                column: "PumpSlot");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DrinkOrder");

            migrationBuilder.DropTable(
                name: "Ingredient");

            migrationBuilder.DropTable(
                name: "Drink");

            migrationBuilder.DropTable(
                name: "IngredientInBottle");

            migrationBuilder.DropTable(
                name: "Pump");
        }
    }
}
