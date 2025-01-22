import { Injectable } from '@angular/core';
import {Ingredient} from './ingredients.service';
import {Observable} from 'rxjs';

export interface Drink {
  id: number;
  name: string;
  img: string;
  toppings: string;
  ingredients: {
    name: string;
    amount: number;
  }[];
}

const drinks: Drink[] = [
  {
    id: 1,
    name: "Mojito",
    img: "https://images.lecker.de/klassischer-mojito-rezept,id=56ad8212,b=lecker,w=980,rm=sk.webp",
    toppings: "Mint leaves, Sugar Syrup, Ice Cubes, abscd efghi jklmn",
    ingredients: [
      { name: "White Rum", amount: 50 },
      { name: "Lime Juice", amount: 25 },
      { name: "Soda Water", amount: 100 }
    ],
  },
  {
    id: 2,
    name: "Pina Colada",
    img: "https://salimaskitchen.com/wp-content/uploads/2024/07/10-Minute-Pina-Colada-Recipe-A-Classic-Puerto-Rican-Cocktail-Salimas-Kitchen-4-3.jpg",
    toppings: "Pineapple slice, Ice Cubes",
    ingredients: [
      { name: "White Rum", amount: 50 },
      { name: "Coconut Cream", amount: 60 },
      { name: "Pineapple Juice", amount: 90 }
    ],
  },
  {
    id: 3,
    name: "Strawberry Smoothie",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGrMLZt3CWkuRK7KH6OwS4jZJLoqS5ZTZetA&s",
    toppings: "Strawberry slices, Honey, Yogurt",
    ingredients: [
      { name: "Milk", amount: 200 }
    ],
  },
  {
    id: 4,
    name: "Espresso Martini",
    img: "https://www.maltwhisky.de/wp-content/uploads/2022/01/espresso-martini-pexels-sebastian-coman-photography-3407778.jpg",
    toppings: "Coffee beans",
    ingredients: [
      { name: "Vodka", amount: 50 },
      { name: "Espresso", amount: 30 },
      { name: "Coffee Liqueur", amount: 20 },
    ],
  },
  {
    id: 5,
    name: "Matcha Latte",
    img: "https://www.einfachbacken.de/sites/einfachbacken.de/files/styles/full_width_tablet_4_3/public/2021-08/matcha_latte_2.jpg?h=4521fff0&itok=1MACEM-l",
    toppings: "Matcha Powder, Honey",
    ingredients: [
      { name: "Hot Water", amount: 50 },
      { name: "Milk", amount: 200 }
    ],
  },
  {
    id: 6,
    name: "Margarita",
    img: "https://www.absolutdrinks.com/wp-content/uploads/recipe_margarita_1x1_27054dff46d6e7418e0a608f5beae5a4.jpg",
    toppings: "Salted rim, Ice Cubes",
    ingredients: [
      { name: "Tequila", amount: 50 },
      { name: "Lime Juice", amount: 25 },
      { name: "Triple Sec", amount: 20 }
    ],
  },
  {
    id: 7,
    name: "Iced Americano",
    img: "data:image/jpeg;base64,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",
    toppings: "Ice cubes",
    ingredients: [
      { name: "Espresso", amount: 50 },
      { name: "Cold Water", amount: 150 }
    ],
  },
  {
    id: 8,
    name: "Hot Chocolate",
    img: "https://hips.hearstapps.com/hmg-prod/images/hot-chocolate-index-675c61bc88ba1.jpg?crop=0.502xw:1.00xh;0.232xw,0&resize=1200:*",
    toppings: "Whipped cream, Sugar,Cocoa Poweder, Whipped cream",
    ingredients: [
      { name: "Milk", amount: 250 }
    ],
  },
];




@Injectable({
  providedIn: 'root'
})
export class DrinkService {
  getDrinks(): Drink[] {
    return drinks;
  }

  constructor() { }
}
