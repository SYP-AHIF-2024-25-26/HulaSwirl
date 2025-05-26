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
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    console.log(headers)
    await firstValueFrom(this.httpClient.post(this.apiBaseUrl + "/drinks/create", drinkdata, {headers}));
    await this.loadDrinks();
  }

  async orderDrink(ID: number) {
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    const res = await firstValueFrom(this.httpClient.post(this.apiBaseUrl + "/orders/drink/" + ID, {}, {
      headers,
      observe: 'response'
    }));
    if (res.status === 200 || res.status === 201) {
      await this.loadDrinks();
    }
  }

  async deleteDrink(ID: number) {
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    await firstValueFrom(this.httpClient.delete(this.apiBaseUrl + "/drinks/delete/" + ID, {headers}));
    this.drinks.update(drinks => drinks.filter(drink => drink.id !== ID));
  }

  async editDrink(drinkdata: DrinkBase, ID: number) {
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    await firstValueFrom(this.httpClient.patch(this.apiBaseUrl + "/drinks/update/" + ID, drinkdata, {headers}));
    await this.loadDrinks();
  }
}
