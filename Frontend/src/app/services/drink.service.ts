import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

export interface DrinkBase {
  name: string;
  available: boolean;
  imgUrl: string ;
  toppings: string;
  drinkIngredients: {
    ingredientName: string;
    amount: number
  }[];
}

export interface Drink extends DrinkBase{
  id: number;
}

const drinks: Drink[] = [
  {
    id: 1,
    name: 'Basic Apple Juice',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+1',
    toppings: 'None',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 }
    ]
  },
  {
    id: 2,
    name: 'Mixed Apple Juice',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+2',
    toppings: 'None',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 60 }
    ]
  },
  {
    id: 3,
    name: 'Apple Fizz',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+3',
    toppings: 'Bubbles',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 50 },
      { ingredientName: 'Sugar Syrup', amount: 10 }
    ]
  },
  {
    id: 4,
    name: 'Apple Mint',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+4',
    toppings: 'Mint',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 50 },
      { ingredientName: 'Mint Leaves', amount: 10 }
    ]
  },
  {
    id: 5,
    name: 'Refreshing Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+5',
    toppings: 'Ice',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 60 }
    ]
  },
  {
    id: 6,
    name: 'Sweet Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+6',
    toppings: 'Sugar Rim',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 40 },
      { ingredientName: 'Sugar Syrup', amount: 20 }
    ]
  },
  {
    id: 7,
    name: 'Crisp Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+7',
    toppings: 'None',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 }
    ]
  },
  {
    id: 8,
    name: 'Apple Cooler',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+8',
    toppings: 'Lemon Twist',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 60 }
    ]
  },
  {
    id: 9,
    name: 'Zesty Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+9',
    toppings: 'Mint & Lemon',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 40 },
      { ingredientName: 'Mint Leaves', amount: 20 }
    ]
  },
  {
    id: 10,
    name: 'Spiced Apple',
    available: true,
    imgUrl: 'https://dummyimage.com/200x200/000/fff&text=Drink+10',
    toppings: 'Cinnamon',
    drinkIngredients: [
      { ingredientName: 'Apple Juice', amount: 40 },
      { ingredientName: 'Water', amount: 60 }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class DrinkService {
  private readonly httpClient = inject(HttpClient);
  drinks: WritableSignal<Drink[]> = signal([]);

  async reloadDrinks(){
    try {
      this.drinks.set(await firstValueFrom(this.httpClient.get<Drink[]>(environment.apiUrl + "/drinks")));
      console.log(this.drinks());
    } catch (e) {
      console.error("Using default drinks", e);
      this.drinks.set(drinks);
    }
  }

  async postNewDrink(drinkdata: DrinkBase){
    await firstValueFrom(this.httpClient.post(environment.apiUrl + "/drinks/create", drinkdata));
    await this.reloadDrinks();
  }
  async orderDrink(ID: number) {
    await firstValueFrom(this.httpClient.get(environment.apiUrl + "/drinks/order?id=" + ID));
    await this.reloadDrinks();
  }
  async deleteDrink(ID: number){
    console.log("rawr delete")
    await firstValueFrom(this.httpClient.delete(environment.apiUrl + "/drinks/delete?id=" + ID));
    this.drinks.update(drinks => drinks.filter(drink => drink.id !== ID));
  }
  async editDrink(drinkdata: DrinkBase, ID: number){
    console.log("Editdrinkpatch"+drinkdata);
    await firstValueFrom(this.httpClient.patch(environment.apiUrl + "/drinks/update?id=" + ID, drinkdata));
    await this.reloadDrinks();
  }
}
