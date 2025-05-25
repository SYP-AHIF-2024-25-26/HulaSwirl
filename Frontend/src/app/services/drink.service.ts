import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {StatusService} from './status.service';
import {UserService} from './user.service';
import {BASE_URL} from '../app.config';

export interface DrinkBase {
  name: string;
  available: boolean;
  imgUrl: string;
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
  private readonly errorService = inject(StatusService);
  private readonly userService =inject(UserService);
  private apiBaseUrl = inject(BASE_URL);
  drinks: WritableSignal<Drink[]> = signal([]);

  async reloadDrinks() {
    const todo = "'Reloading Drinks'"
    try {
      console.log(todo);
      this.drinks.set(await firstValueFrom(this.httpClient.get<Drink[]>(this.apiBaseUrl + "/drinks")));
    } catch (e) {
      console.error(`An error occurred while ${todo}, placeholders will be shown.`, e);
      this.drinks.set(drinks);
    }
  }

  async postNewDrink(drinkdata: DrinkBase) {
    const todo = "Creating new drink"
    try {
      console.log(todo);
      const jwt = this.userService.getTokenFromStorage();
      const headers = {
        Authorization: `Bearer ${jwt}`
      };
      console.log(headers)
      await firstValueFrom(this.httpClient.post(this.apiBaseUrl + "/drinks/create", drinkdata,{headers}));
      await this.reloadDrinks();
    } catch (e: unknown) {
      this.errorService.handleError(e, todo);
    }
  }

  async orderDrink(ID: number) {
    const todo = "Ordering a Drink"
    console.log(todo);
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    try {
      const res = await firstValueFrom(this.httpClient.post(this.apiBaseUrl + "/orders/drink/" + ID,{},{headers,observe: 'response'}));
      if (res.status === 200 || res.status === 201) {
        await this.reloadDrinks();
        this.errorService.showStatus("Your order has been submitted, please go to the order terminal and confirm your order");
      }
    } catch (e: unknown) {
      if (e instanceof HttpErrorResponse) {
        this.errorService.handleError(e, todo);
      }
    }
  }

  async deleteDrink(ID: number) {
    const todo = "Deleting drink"
    try {
      console.log(todo);
      const jwt = this.userService.getTokenFromStorage();
      const headers = {
        Authorization: `Bearer ${jwt}`
      };
      await firstValueFrom(this.httpClient.delete(this.apiBaseUrl + "/drinks/delete?id=" + ID,{headers}));
      this.drinks.update(drinks => drinks.filter(drink => drink.id !== ID));
    } catch (e: unknown) {
      this.errorService.handleError(e, todo);
    }
  }

  async editDrink(drinkdata: DrinkBase, ID: number) {
    const todo = "Editing drink"
    try {
      console.log(todo);
      const jwt = this.userService.getTokenFromStorage();
      const headers = {
        Authorization: `Bearer ${jwt}`
      };
      await firstValueFrom(this.httpClient.patch(this.apiBaseUrl + "/drinks/update?id=" + ID, drinkdata,{headers}));
      await this.reloadDrinks();
    } catch (e: unknown) {
      this.errorService.handleError(e, todo);
    }
  }
}
