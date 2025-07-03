import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {ErrorService} from './error.service';
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
      const headers = new HttpHeaders({'X-Skip-Loader': 'true'});
      const drinks = await firstValueFrom(
        this.httpClient.get<Drink[]>(this.apiBaseUrl + "/drinks", {headers})
      );
      this.drinks.set(drinks);
    } catch (e) {
      console.error(`An error occurred while loading drinks.`, e);
    }
  }

  async postNewDrink(drinkdata: DrinkBase) {
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    const drink = await firstValueFrom(this.httpClient.post<Drink>(this.apiBaseUrl + "/drinks/create", drinkdata, {headers}));
    this.drinks.update(drinks => [...drinks, this.transformDrink(drink)]);
  }

  async orderDrink(ID: number, containsIce: boolean = false) {
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    await firstValueFrom(this.httpClient.post(this.apiBaseUrl + `/orders/drink/${ID}?containsIce=${containsIce}`, {}, {
      headers,
      observe: 'response'
    }));
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
    const drink = await firstValueFrom(this.httpClient.patch<Drink>(this.apiBaseUrl + "/drinks/update/" + ID, drinkdata, {headers}));
    this.drinks.update(drinks => drinks.map(drinkItem => drinkItem.id === ID ? this.transformDrink(drink) : drinkItem));
  }

  private transformDrink(drink: any): Drink {
    return {
      ...drink,
      drinkIngredients: drink.drinkIngredients.map((ingredient: any) => {
        return {
          ...ingredient,
          ingredientName: ingredient.ingredientNameFk,
        };
      })
    };
  }
}
