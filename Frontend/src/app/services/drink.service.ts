import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

export interface Drink {
  id: number;
  name: string;
  available:boolean;
  imgUrl: string;
  toppings: string;
  drinkIngredients: {
    id: number,
    ingredientName: string;
    amount: number,
    drinkID: number
  }[];
}

const drinks: Drink[] = [
  {
    id: 1,
    name: 'Basic Apple Juice',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+1',
    toppings: 'None',
    drinkIngredients: [
      { id: 1, ingredientName: 'Apple Juice', amount: 40, drinkID: 1 }
    ]
  },
  {
    id: 2,
    name: 'Mixed Apple Juice',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+2',
    toppings: 'None',
    drinkIngredients: [
      { id: 2, ingredientName: 'Apple Juice', amount: 40, drinkID: 2 },
      { id: 3, ingredientName: 'Water', amount: 60, drinkID: 2 }
    ]
  },
  {
    id: 3,
    name: 'Apple Fizz',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+3',
    toppings: 'Bubbles',
    drinkIngredients: [
      { id: 4, ingredientName: 'Apple Juice', amount: 40, drinkID: 3 },
      { id: 5, ingredientName: 'Water', amount: 50, drinkID: 3 },
      { id: 6, ingredientName: 'Sugar Syrup', amount: 10, drinkID: 3 }
    ]
  },
  {
    id: 4,
    name: 'Apple Mint',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+4',
    toppings: 'Mint',
    drinkIngredients: [
      { id: 7, ingredientName: 'Apple Juice', amount: 40, drinkID: 4 },
      { id: 8, ingredientName: 'Water', amount: 50, drinkID: 4 },
      { id: 9, ingredientName: 'Mint Leaves', amount: 10, drinkID: 4 }
    ]
  },
  {
    id: 5,
    name: 'Refreshing Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+5',
    toppings: 'Ice',
    drinkIngredients: [
      { id: 10, ingredientName: 'Apple Juice', amount: 40, drinkID: 5 },
      { id: 11, ingredientName: 'Water', amount: 60, drinkID: 5 }
    ]
  },
  {
    id: 6,
    name: 'Sweet Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+6',
    toppings: 'Sugar Rim',
    drinkIngredients: [
      { id: 12, ingredientName: 'Apple Juice', amount: 40, drinkID: 6 },
      { id: 13, ingredientName: 'Water', amount: 40, drinkID: 6 },
      { id: 14, ingredientName: 'Sugar Syrup', amount: 20, drinkID: 6 }
    ]
  },
  {
    id: 7,
    name: 'Crisp Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+7',
    toppings: 'None',
    drinkIngredients: [
      { id: 15, ingredientName: 'Apple Juice', amount: 40, drinkID: 7 }
    ]
  },
  {
    id: 8,
    name: 'Apple Cooler',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+8',
    toppings: 'Lemon Twist',
    drinkIngredients: [
      { id: 16, ingredientName: 'Apple Juice', amount: 40, drinkID: 8 },
      { id: 17, ingredientName: 'Water', amount: 60, drinkID: 8 }
    ]
  },
  {
    id: 9,
    name: 'Zesty Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+9',
    toppings: 'Mint & Lemon',
    drinkIngredients: [
      { id: 18, ingredientName: 'Apple Juice', amount: 40, drinkID: 9 },
      { id: 19, ingredientName: 'Water', amount: 40, drinkID: 9 },
      { id: 20, ingredientName: 'Mint Leaves', amount: 20, drinkID: 9 }
    ]
  },
  {
    id: 10,
    name: 'Spiced Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+10',
    toppings: 'Cinnamon',
    drinkIngredients: [
      { id: 21, ingredientName: 'Apple Juice', amount: 40, drinkID: 10 },
      { id: 22, ingredientName: 'Water', amount: 60, drinkID: 10 }
    ]
  }
];

export interface NewDrinkDTO {
  name: string,
  img: string|null,
  toppings: string,
  ingredients:
    {
      "name": string,
      "amount": number
    }[]

}
export interface EditDrinkDTO {
  id:number
  name: string,
  available:boolean,
  img: string|null,
  toppings: string
}




@Injectable({
  providedIn: 'root'
})
export class DrinkService {
  private readonly httpClient = inject(HttpClient);
  drinks: WritableSignal<Drink[]> = signal([]);

  async reloadDrinks(){
    try {
      this.drinks.set(await firstValueFrom(this.httpClient.get<Drink[]>(environment.apiUrl + "/drinks")));
    } catch (e) {
      console.error("Using default drinks", e);
      this.drinks.set(drinks);
    }
  }

  // TODO: REMOVE THIS AFTER COMPATIBILITY WITH DRINKS SIGNAL IS ASSURED
  async getDrinks(): Promise<Drink[]> {
    return this.drinks();
  }
  async orderDrink(drink: Drink) {
    await firstValueFrom(this.httpClient.post(environment.apiUrl + "/drinks?id=", drink.id));
    await this.reloadDrinks();
  }
  async postNewDrink(drinkdata:NewDrinkDTO){
    await firstValueFrom(this.httpClient.post(environment.apiUrl + "/drinks", drinkdata));
    await this.reloadDrinks();
  }
  async deleteDrink(ID:number){
    console.log("rawr delete")
    await firstValueFrom(this.httpClient.delete(environment.apiUrl + "/drinks?id=" + ID));
    this.drinks.update(drinks => drinks.filter(drink => drink.id !== ID));
  }
  async editDrink(drinkdata:EditDrinkDTO){
    console.log("rawr edit")
    await firstValueFrom(this.httpClient.put(environment.apiUrl + "/drinks", drinkdata));
    await this.reloadDrinks();
  }
}
