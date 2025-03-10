import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

export interface Drink {
  id: number;
  name: string;
  enabled:boolean;
  available:boolean;
  img: string;
  toppings: string;
  drinkIngredients: {
    name: string;
    amount: number;
  }[];
}

const drinks: Drink[] = [
  {
    id: 1,
    name: 'Basic Apple Juice',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+1',
    toppings: 'None',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 }
    ]
  },
  {
    id: 2,
    name: 'Mixed Apple Juice',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+2',
    toppings: 'None',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 60 }
    ]
  },
  {
    id: 3,
    name: 'Apple Fizz',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+3',
    toppings: 'Bubbles',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 50 },
      { name: 'Sugar Syrup', amount: 10 }
    ]
  },
  {
    id: 4,
    name: 'Apple Mint',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+4',
    toppings: 'Mint',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 50 },
      { name: 'Mint Leaves', amount: 10 }
    ]
  },
  {
    id: 5,
    name: 'Refreshing Apple',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+5',
    toppings: 'Ice',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 60 }
    ]
  },
  {
    id: 6,
    name: 'Sweet Apple',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+6',
    toppings: 'Sugar Rim',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 40 },
      { name: 'Sugar Syrup', amount: 20 }
    ]
  },
  {
    id: 7,
    name: 'Crisp Apple',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+7',
    toppings: 'None',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 }
    ]
  },
  {
    id: 8,
    name: 'Apple Cooler',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+8',
    toppings: 'Lemon Twist',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 60 }
    ]
  },
  {
    id: 9,
    name: 'Zesty Apple',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+9',
    toppings: 'Mint & Lemon',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 40 },
      { name: 'Mint Leaves', amount: 20 }
    ]
  },
  {
    id: 10,
    name: 'Spiced Apple',
    enabled: true,
    available: true,
    img: 'https://dummyimage.com/200x200/000/fff&text=Drink+10',
    toppings: 'Cinnamon',
    drinkIngredients: [
      { name: 'Apple Juice', amount: 40 },
      { name: 'Water', amount: 60 }
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
    this.drinks.set(drinks);
    /*
    try {
      this.drinks.set(await firstValueFrom(this.httpClient.get<Drink[]>(environment.apiUrl + "/drinks"));
    } catch (e) {
      console.error("Using default drinks", e);
      this.drinks.set(drinkData);
    }
    */
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
