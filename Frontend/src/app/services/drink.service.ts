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

@Injectable({
  providedIn: 'root'
})
export class DrinkService {
  private readonly httpClient = inject(HttpClient);
  private readonly errorService = inject(StatusService);
  private readonly userService =inject(UserService);
  private apiBaseUrl = inject(BASE_URL);
  drinks: WritableSignal<Drink[]> = signal([]);

  async loadDrinks() {
    try {
      this.drinks.set(await firstValueFrom(this.httpClient.get<Drink[]>(this.apiBaseUrl + "/drinks")));
    } catch (e) {
      console.error(`An error occurred while loading drinks.`, e);
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
      await this.loadDrinks();
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
        await this.loadDrinks();
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
      await firstValueFrom(this.httpClient.delete(this.apiBaseUrl + "/drinks/delete/" + ID,{headers}));
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
      await firstValueFrom(this.httpClient.patch(this.apiBaseUrl + "/drinks/update/" + ID, drinkdata,{headers}));
      await this.loadDrinks();
    } catch (e: unknown) {
      this.errorService.handleError(e, todo);
    }
  }
}
