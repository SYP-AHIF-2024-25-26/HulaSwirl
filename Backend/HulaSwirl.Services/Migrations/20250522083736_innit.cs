using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HulaSwirl.Services.Migrations
{
    /// <inheritdoc />
    public partial class innit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drink",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Available = table.Column<bool>(type: "INTEGER", nullable: false),
                    ImgUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Toppings = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drink", x => x.Id);
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
                name: "User",
                columns: table => new
                {
                    Username = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Username);
                });

            migrationBuilder.CreateTable(
                name: "Ingredient",
                columns: table => new
                {
                    IngredientName = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    RemainingAmount = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxAmount = table.Column<int>(type: "INTEGER", nullable: false),
                    PumpSlot = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredient", x => x.IngredientName);
                    table.ForeignKey(
                        name: "FK_Ingredient_Pump_PumpSlot",
                        column: x => x.PumpSlot,
                        principalTable: "Pump",
                        principalColumn: "Slot");
                });

            migrationBuilder.CreateTable(
                name: "Order",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    User = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    OrderDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DrinkName = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Username = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Order", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Order_User_Username",
                        column: x => x.Username,
                        principalTable: "User",
                        principalColumn: "Username");
                });

            migrationBuilder.CreateTable(
                name: "UserDrinkStat",
                columns: table => new
                {
                    UserName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DrinkId = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDrinkStat", x => new { x.UserName, x.DrinkId });
                    table.ForeignKey(
                        name: "FK_UserDrinkStat_Drink_DrinkId",
                        column: x => x.DrinkId,
                        principalTable: "Drink",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserDrinkStat_User_UserName",
                        column: x => x.UserName,
                        principalTable: "User",
                        principalColumn: "Username",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DrinkIngredient",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DrinkId = table.Column<int>(type: "INTEGER", nullable: true),
                    IngredientNameFk = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Amount = table.Column<int>(type: "INTEGER", nullable: false),
                    IngredientName = table.Column<string>(type: "TEXT", nullable: true),
                    OrderId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrinkIngredient", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DrinkIngredient_Drink_DrinkId",
                        column: x => x.DrinkId,
                        principalTable: "Drink",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DrinkIngredient_Ingredient_IngredientName",
                        column: x => x.IngredientName,
                        principalTable: "Ingredient",
                        principalColumn: "IngredientName");
                    table.ForeignKey(
                        name: "FK_DrinkIngredient_Order_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Order",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DrinkIngredient_DrinkId",
                table: "DrinkIngredient",
                column: "DrinkId");

            migrationBuilder.CreateIndex(
                name: "IX_DrinkIngredient_IngredientName",
                table: "DrinkIngredient",
                column: "IngredientName");

            migrationBuilder.CreateIndex(
                name: "IX_DrinkIngredient_OrderId",
                table: "DrinkIngredient",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredient_PumpSlot",
                table: "Ingredient",
                column: "PumpSlot");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Username",
                table: "Order",
                column: "Username");

            migrationBuilder.CreateIndex(
                name: "IX_UserDrinkStat_DrinkId",
                table: "UserDrinkStat",
                column: "DrinkId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DrinkIngredient");

            migrationBuilder.DropTable(
                name: "UserDrinkStat");

            migrationBuilder.DropTable(
                name: "Ingredient");

            migrationBuilder.DropTable(
                name: "Order");

            migrationBuilder.DropTable(
                name: "Drink");

            migrationBuilder.DropTable(
                name: "Pump");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
